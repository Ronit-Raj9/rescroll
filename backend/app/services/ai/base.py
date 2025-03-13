from abc import ABC, abstractmethod
from typing import List, Dict, Any

class BaseAIService(ABC):
    """Base interface for AI services"""
    
    @abstractmethod
    async def generate_summary(self, text: str, max_length: int = 500) -> str:
        """Generate summary from text"""
        pass
    
    @abstractmethod
    async def generate_quiz(self, text: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        """Generate quiz questions from text"""
        pass
    
    @abstractmethod
    async def generate_key_insights(self, text: str, num_insights: int = 5) -> List[str]:
        """Extract key insights from text"""
        pass
    
    @abstractmethod
    async def generate_tags(self, text: str, num_tags: int = 5) -> List[str]:
        """Generate relevant tags from text"""
        pass 