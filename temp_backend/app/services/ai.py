from typing import List, Dict, Any
import openai
from app.core.config import settings

class AIService:
    def __init__(self):
        openai.api_key = settings.OPENAI_API_KEY

    async def generate_news_report(self, paper_title: str, abstract: str,
                                 key_findings: List[str], technical_terms: List[str]) -> Dict[str, Any]:
        prompt = f"""
        Convert this research paper into an engaging news report:
        
        Title: {paper_title}
        Abstract: {abstract}
        Key Findings: {', '.join(key_findings)}
        Technical Terms: {', '.join(technical_terms)}
        
        Please provide:
        1. A catchy news headline
        2. A clear, concise summary
        3. The main content in journalistic style
        4. Simplified explanations of technical terms
        5. Estimated reading time
        6. Difficulty level (Beginner/Intermediate/Advanced)
        """

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a science journalist who converts research papers into engaging news reports."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse and structure the response
        content = response.choices[0].message.content
        # TODO: Implement proper parsing of the AI response
        return {
            "title": paper_title,
            "content": content,
            "summary": "",  # Extract from content
            "key_findings": key_findings,
            "technical_terms": {},  # Extract from content
            "reading_time": 5,  # Calculate based on content length
            "difficulty_level": "Intermediate"  # Determine based on content
        }

    async def generate_quiz(self, paper_title: str, content: str,
                          key_findings: List[str]) -> Dict[str, Any]:
        prompt = f"""
        Generate a quiz to test understanding of this research paper:
        
        Title: {paper_title}
        Content: {content}
        Key Findings: {', '.join(key_findings)}
        
        Please provide:
        1. 5 multiple-choice questions
        2. Correct answers
        3. Explanations for each answer
        4. Difficulty level
        """

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an educational expert who creates quizzes to test understanding of research papers."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000
        )

        # Parse and structure the response
        content = response.choices[0].message.content
        # TODO: Implement proper parsing of the AI response
        return {
            "questions": [],  # Extract from content
            "answers": {},  # Extract from content
            "explanations": {},  # Extract from content
            "difficulty_level": "Intermediate"  # Extract from content
        }

    async def generate_vector_embedding(self, text: str) -> List[float]:
        response = await openai.Embedding.acreate(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding

    async def analyze_sentiment(self, text: str) -> Dict[str, float]:
        prompt = f"""
        Analyze the sentiment of this text:
        {text}
        
        Provide sentiment scores for:
        1. Overall sentiment (positive/negative/neutral)
        2. Confidence in the analysis
        """

        response = await openai.ChatCompletion.acreate(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a sentiment analysis expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=100
        )

        # Parse and structure the response
        content = response.choices[0].message.content
        # TODO: Implement proper parsing of the AI response
        return {
            "sentiment": 0.0,  # Extract from content
            "confidence": 0.0  # Extract from content
        } 