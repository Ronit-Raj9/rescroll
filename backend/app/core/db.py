from supabase import create_client, Client
from app.core.config import settings

# Initialize Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_KEY
)

print("Supabase: ",supabase)

# You can add other database-related functions here
async def test_db_connection():
    try:
        result = supabase.table("users").select("count").execute()
        return True
    except Exception as e:
        return False 