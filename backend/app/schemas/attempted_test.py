from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

class AttemptedAnswer(BaseModel):
    questionId: str
    selectedOption: int
    isCorrect: bool
    marks: float

class TestSubmission(BaseModel):
    answers: List[AttemptedAnswer]
    totalMarks: float = Field(..., ge=0)
    totalQuestions: int = Field(..., gt=0)
    correctAnswers: int = Field(..., ge=0)
    wrongAnswers: int = Field(..., ge=0)
    timeTaken: int = Field(..., ge=0)  # Time taken in seconds

class TestAnalysis(BaseModel):
    id: str
    userId: str
    answers: List[AttemptedAnswer]
    totalMarks: float
    totalQuestions: int
    correctAnswers: int
    wrongAnswers: int
    timeTaken: int
    createdAt: datetime
    updatedAt: datetime

    class Config:
        from_attributes = True

class TestUpdate(BaseModel):
    answers: Optional[List[AttemptedAnswer]] = None
    totalMarks: Optional[float] = None
    totalQuestions: Optional[int] = None
    correctAnswers: Optional[int] = None
    wrongAnswers: Optional[int] = None
    timeTaken: Optional[int] = None 