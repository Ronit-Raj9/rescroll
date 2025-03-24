import pytest
from typing import Generator, Dict
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.core.config import settings
from app.db.base import Base
from app.tests.utils.utils import get_superuser_token_headers

# Create test database URL
TEST_SQLALCHEMY_DATABASE_URL = settings.SQLALCHEMY_DATABASE_URI + "_test"

# Create test engine
engine = create_async_engine(
    TEST_SQLALCHEMY_DATABASE_URL,
    poolclass=None,
)

# Create test session
TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
)

@pytest.fixture(scope="session")
def db() -> Generator:
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="module")
def client() -> Generator:
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="module")
def superuser_token_headers(client: TestClient) -> Dict[str, str]:
    return get_superuser_token_headers()

@pytest.fixture(scope="module")
def normal_user_token_headers(client: TestClient, db: AsyncSession) -> Dict[str, str]:
    from app.tests.utils.utils import get_normal_user_token_headers
    return get_normal_user_token_headers(db) 