from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class QuestionBase(BaseModel):
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    options: List[str] = Field(..., min_items=2)
    correctOption: int = Field(..., ge=0)
    explanation: Optional[str] = None
    subject: str
    topic: str
    difficulty: str = Field(..., pattern="^(easy|medium|hard)$")
    marks: int = Field(..., gt=0)

class QuestionCreate(QuestionBase):
    pass

class QuestionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    options: Optional[List[str]] = None
    correctOption: Optional[int] = None
    explanation: Optional[str] = None
    subject: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None
    marks: Optional[int] = None

class QuestionResponse(QuestionBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True 