from typing import List, Dict, Any
import google.generativeai as genai
from app.core.config import settings
from app.services.ai.base import BaseAIService

class GeminiAIService(BaseAIService):
    """Gemini AI service implementation"""
    
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def generate_summary(self, text: str, max_length: int = 500) -> str:
        """Generate summary using Gemini"""
        prompt = f"Summarize the following text in about {max_length} characters:\n\n{text}"
        response = await self.model.generate_content_async(prompt)
        return response.text
    
    async def generate_quiz(self, text: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        """Generate quiz questions using Gemini"""
        prompt = f"""Generate {num_questions} multiple choice questions based on this text. 
        Format each question as a JSON object with fields: question, options (array of 4 choices), 
        correct_answer (index 0-3), and explanation. Return as a JSON array.\n\n{text}"""
        
        response = await self.model.generate_content_async(prompt)
        try:
            return eval(response.text)  # Convert string representation of list to actual list
        except:
            return []  # Return empty list if parsing fails
    
    async def generate_key_insights(self, text: str, num_insights: int = 5) -> List[str]:
        """Extract key insights using Gemini"""
        prompt = f"Extract {num_insights} key insights from this text. Format as a Python list of strings:\n\n{text}"
        response = await self.model.generate_content_async(prompt)
        try:
            return eval(response.text)  # Convert string representation of list to actual list
        except:
            return []  # Return empty list if parsing fails
    
    async def generate_tags(self, text: str, num_tags: int = 5) -> List[str]:
        """Generate relevant tags using Gemini"""
        prompt = f"Generate {num_tags} relevant tags or keywords from this text. Format as a Python list of strings:\n\n{text}"
        response = await self.model.generate_content_async(prompt)
        try:
            return eval(response.text)  # Convert string representation of list to actual list
        except:
            return []  # Return empty list if parsing fails 