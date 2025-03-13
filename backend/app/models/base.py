from datetime import datetime
from typing import Any

from sqlalchemy import Column, DateTime, MetaData
from sqlalchemy.ext.declarative import as_declarative, declared_attr

# Create a metadata instance
metadata = MetaData()

@as_declarative()
class Base:
    id: Any
    __name__: str
    metadata = metadata
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower()
    
    # Common columns for all tables
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False) 