from typing import List, Dict, Any
from celery import Celery
from app.core.config import settings
from app.services.tasks import TaskService

# Initialize Celery
celery_app = Celery(
    'rescroll',
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Configure Celery
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour
    worker_max_tasks_per_child=100,
    worker_prefetch_multiplier=1
)

@celery_app.task(name='fetch_and_process_papers')
def fetch_and_process_papers(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    """Fetch and process papers from multiple sources"""
    task_service = TaskService()
    return task_service.fetch_and_process_papers(query, limit)

@celery_app.task(name='update_trending_papers')
def update_trending_papers() -> List[Dict[str, Any]]:
    """Update trending papers"""
    task_service = TaskService()
    return task_service.update_trending_papers()

@celery_app.task(name='generate_quizzes')
def generate_quizzes(paper_ids: List[str]) -> List[Dict[str, Any]]:
    """Generate quizzes for multiple papers"""
    task_service = TaskService()
    return task_service.generate_quizzes(paper_ids)

@celery_app.task(name='cleanup_old_data')
def cleanup_old_data(days: int = 30) -> bool:
    """Clean up old data from analytics database"""
    task_service = TaskService()
    return task_service.cleanup_old_data(days)

@celery_app.task(name='update_user_analytics')
def update_user_analytics(user_id: int) -> Dict[str, Any]:
    """Update user analytics"""
    task_service = TaskService()
    return task_service.update_user_analytics(user_id)

# Schedule periodic tasks
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # Update trending papers every 6 hours
    sender.add_periodic_task(
        21600.0,  # 6 hours in seconds
        update_trending_papers.s(),
        name='update-trending-papers'
    )
    
    # Clean up old data every day at midnight
    sender.add_periodic_task(
        86400.0,  # 24 hours in seconds
        cleanup_old_data.s(),
        name='cleanup-old-data'
    )
    
    # Update user analytics every day at 1 AM
    sender.add_periodic_task(
        90000.0,  # 25 hours in seconds (to avoid exact midnight)
        update_user_analytics.s(),
        name='update-user-analytics'
    )

# Error handling
@celery_app.task_failure.connect
def handle_task_failure(task_id, exception, args, kwargs, traceback, einfo, **kw):
    """Handle task failures"""
    print(f"Task {task_id} failed: {str(exception)}")
    # TODO: Implement proper error handling (e.g., logging, notifications)

# Task monitoring
@celery_app.task_success.connect
def handle_task_success(task_id, result, **kwargs):
    """Handle successful task completion"""
    print(f"Task {task_id} completed successfully")
    # TODO: Implement proper success handling (e.g., logging, metrics) 