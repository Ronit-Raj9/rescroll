from setuptools import setup, find_packages

setup(
    name="rescroll",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "alembic",
        "psycopg2-binary",
        "pydantic",
        "pydantic-settings",
        "python-jose",
        "passlib",
        "python-multipart",
        "python-dotenv",
    ],
) 