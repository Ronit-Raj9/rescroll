from app.db.base_class import Base  # noqa: F401

# Import all models here so that alembic can discover them
from app.models.associations import user_interests  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.topic import Topic  # noqa: F401
from app.models.reading_history import ReadingHistory  # noqa: F401
from app.models.quiz_result import QuizResult  # noqa: F401
from app.models.user_preference import UserPreference  # noqa: F401
from app.models.paper_summary_request import PaperSummaryRequest  # noqa: F401 