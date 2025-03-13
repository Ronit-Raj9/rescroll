from clickhouse_driver import Client
from app.core.config import settings

clickhouse_client = Client(
    host=settings.CLICKHOUSE_HOST,
    port=settings.CLICKHOUSE_PORT,
    database=settings.CLICKHOUSE_DB,
    user=settings.CLICKHOUSE_USER,
    password=settings.CLICKHOUSE_PASSWORD
)

def get_clickhouse():
    try:
        yield clickhouse_client
    finally:
        clickhouse_client.disconnect() 