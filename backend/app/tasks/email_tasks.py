from celery import shared_task
from app.core.celery_app import celery_app
from app.utils.email import (
    send_reset_password_email,
    send_paper_summary_email,
    send_welcome_email
)
import logging

logger = logging.getLogger(__name__)

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,  # 1 minute
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,  # 5 minutes
    retry_jitter=True
)
def send_reset_password_email_task(self, email_to: str, email: str, token: str):
    """
    Send password reset email asynchronously.
    """
    try:
        send_reset_password_email(email_to=email_to, email=email, token=token)
        return {"status": "success", "email": email_to}
    except Exception as e:
        logger.error(f"Error sending reset password email: {str(e)}")
        raise self.retry(exc=e)

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True
)
def send_welcome_email_task(self, email_to: str, username: str):
    """
    Send welcome email to new users asynchronously.
    """
    try:
        send_welcome_email(email_to=email_to, username=username)
        return {"status": "success", "email": email_to}
    except Exception as e:
        logger.error(f"Error sending welcome email: {str(e)}")
        raise self.retry(exc=e)

@celery_app.task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_backoff_max=300,
    retry_jitter=True
)
def send_paper_summary_email_task(self, email_to: str, paper_id: str, summary: str):
    """
    Send paper summary email asynchronously.
    """
    try:
        send_paper_summary_email(email_to=email_to, paper_id=paper_id, summary=summary)
        return {"status": "success", "email": email_to, "paper_id": paper_id}
    except Exception as e:
        logger.error(f"Error sending paper summary email: {str(e)}")
        raise self.retry(exc=e) 