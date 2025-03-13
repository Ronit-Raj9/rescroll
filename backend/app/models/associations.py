from sqlalchemy import Column, Integer, ForeignKey, Table
from app.db.base_class import Base

# Association table for user interests
user_interests = Table(
    'user_interests',
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('topic_id', Integer, ForeignKey('topics.id'), primary_key=True)
) 