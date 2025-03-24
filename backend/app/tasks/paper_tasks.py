from celery import shared_task
from app.core.celery_app import celery_app
from app.utils.ai import generate_paper_summary
from app.utils.email import send_paper_summary_email
import logging

logger = logging.getLogger(__name__)

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=300,  # 5 minutes
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=600,  # 10 minutes
    retry_jitter=True
)
def generate_paper_summary_task(self, paper_id: str, user_email: str):
    """
    Generate a summary for a paper using Gemini AI and send it via email.
    """
    try:
        # Generate summary
        summary = generate_paper_summary(paper_id)
        
        # Send email with summary
        send_paper_summary_email(
            email_to=user_email,
            paper_id=paper_id,
            summary=summary
        )
        
        return {"status": "success", "paper_id": paper_id}
    
    except Exception as e:
        logger.error(f"Error generating paper summary: {str(e)}")
        raise self.retry(exc=e) 