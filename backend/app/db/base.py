from app.db.base_class import Base  # noqa: F401

# Import all models here so that alembic can discover them
from app.models.user import User  # noqa: F401
from app.models.paper_summary_request import PaperSummaryRequest  # noqa: F401
from app.models.analytics import ReadingHistory, QuizResult, UserPreference, WeeklyProgress  # noqa: F401
from app.models.research_paper import ResearchPaper  # noqa: F401
from app.models.news_report import NewsReport  # noqa: F401 