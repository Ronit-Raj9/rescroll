from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.analytics import WeeklyProgress, QuizResult, UserPreference
from app.models.user import User

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def update_user_analytics(self, user_id: int, reading_time: int = 0,
                            articles_read: int = 0, domain: str = None) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            return None

        user.reading_time += reading_time
        user.articles_read += articles_read
        
        if domain:
            if not user.favorite_domains:
                user.favorite_domains = []
            if domain not in user.favorite_domains:
                user.favorite_domains.append(domain)

        # Update reading streak
        today = datetime.now().date().isoformat()
        if user.last_read_date != today:
            if user.last_read_date == (datetime.now() - timedelta(days=1)).date().isoformat():
                user.reading_streak += 1
            else:
                user.reading_streak = 1
            user.last_read_date = today

        self.db.commit()
        self.db.refresh(user)
        return user

    def record_quiz_result(self, user_id: int, paper_id: int, score: float,
                         answers: Dict[str, Any], time_taken: int,
                         difficulty_level: str) -> QuizResult:
        result = QuizResult(
            user_id=user_id,
            paper_id=paper_id,
            score=score,
            answers=answers,
            time_taken=time_taken,
            difficulty_level=difficulty_level
        )
        self.db.add(result)
        self.db.commit()
        self.db.refresh(result)
        return result

    def update_weekly_progress(self, user_id: int, articles_read: int = 0,
                             reading_time: int = 0, domain: str = None,
                             quiz_score: float = None) -> WeeklyProgress:
        today = datetime.now()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        progress = self.db.query(WeeklyProgress).filter(
            WeeklyProgress.user_id == user_id,
            WeeklyProgress.week_start == week_start.isoformat()
        ).first()

        if not progress:
            progress = WeeklyProgress(
                user_id=user_id,
                week_start=week_start.isoformat(),
                week_end=week_end.isoformat(),
                articles_read=0,
                total_reading_time=0,
                domains_covered=[],
                quiz_scores=[]
            )

        progress.articles_read += articles_read
        progress.total_reading_time += reading_time
        
        if domain and domain not in progress.domains_covered:
            progress.domains_covered.append(domain)
        
        if quiz_score is not None:
            progress.quiz_scores.append(quiz_score)

        self.db.add(progress)
        self.db.commit()
        self.db.refresh(progress)
        return progress

    def get_user_preferences(self, user_id: int) -> UserPreference:
        return self.db.query(UserPreference).filter(UserPreference.user_id == user_id).first()

    def update_user_preferences(self, user_id: int, preferred_domains: List[str] = None,
                              preferred_difficulty: str = None,
                              preferred_sources: List[str] = None,
                              notification_preferences: Dict[str, bool] = None) -> UserPreference:
        preferences = self.get_user_preferences(user_id)
        if not preferences:
            preferences = UserPreference(user_id=user_id)

        if preferred_domains is not None:
            preferences.preferred_domains = preferred_domains
        if preferred_difficulty is not None:
            preferences.preferred_difficulty = preferred_difficulty
        if preferred_sources is not None:
            preferences.preferred_sources = preferred_sources
        if notification_preferences is not None:
            preferences.notification_preferences = notification_preferences

        self.db.add(preferences)
        self.db.commit()
        self.db.refresh(preferences)
        return preferences 