from fastapi import FastAPI, Request
import time
import logging

logger = logging.getLogger(__name__)

# Dictionary to store metrics
metrics = {
    "requests": 0,
    "errors": 0,
    "response_times": [],
}

def add_metrics_middleware(app: FastAPI):
    """Add metrics middleware to the FastAPI application."""
    @app.middleware("http")
    async def metrics_middleware(request: Request, call_next):
        # Increment request counter
        metrics["requests"] += 1
        
        # Measure response time
        start_time = time.time()
        
        try:
            # Process the request
            response = await call_next(request)
            
            # Calculate response time
            process_time = time.time() - start_time
            metrics["response_times"].append(process_time)
            
            # Keep only the last 1000 response times to avoid memory issues
            if len(metrics["response_times"]) > 1000:
                metrics["response_times"] = metrics["response_times"][-1000:]
                
            return response
        except Exception as e:
            # Increment error counter
            metrics["errors"] += 1
            logger.error(f"Error in request: {str(e)}")
            raise
    
    # Add a metrics endpoint
    @app.get("/api/v1/metrics")
    async def get_metrics():
        """Endpoint to get metrics data."""
        avg_response_time = sum(metrics["response_times"]) / max(len(metrics["response_times"]), 1)
        
        return {
            "requests": metrics["requests"],
            "errors": metrics["errors"],
            "avg_response_time": avg_response_time,
            "error_rate": metrics["errors"] / max(metrics["requests"], 1),
        }
    
    logger.info("Metrics middleware added to application")
    return app 