from supabase import create_client, Client
from app.core.config import settings
from loguru import logger

def get_supabase_client() -> Client:
    """
    Get a Supabase client instance.
    This can be used to access Supabase specific features like Auth, Storage, and Realtime.
    """
    try:
        return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Error initializing Supabase client: {e}")
        raise 