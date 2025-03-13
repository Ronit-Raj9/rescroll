from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PreviousYearPaperBase(BaseModel):
    title: str = Field(..., min_length=1)
    year: int = Field(..., ge=1900, le=2100)
    subject: str
    totalQuestions: int = Field(..., gt=0)
    totalMarks: float = Field(..., gt=0)
    duration: int = Field(..., gt=0)  # Duration in minutes
    description: Optional[str] = None
    questionIds: List[str] = Field(..., min_items=1)

class PreviousYearPaperCreate(PreviousYearPaperBase):
    pass

class PreviousYearPaperUpdate(BaseModel):
    title: Optional[str] = None
    year: Optional[int] = None
    subject: Optional[str] = None
    totalQuestions: Optional[int] = None
    totalMarks: Optional[float] = None
    duration: Optional[int] = None
    description: Optional[str] = None
    questionIds: Optional[List[str]] = None

class PreviousYearPaperResponse(PreviousYearPaperBase):
    id: str
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True 