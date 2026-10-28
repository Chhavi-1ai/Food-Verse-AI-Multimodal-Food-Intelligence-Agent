import os
from pathlib import Path
from pydantic import BaseModel
from dotenv import load_dotenv

# Load .env file from project root or backend directory
env_path_root = Path(__file__).resolve().parent.parent.parent.parent / ".env"
env_path_backend = Path(__file__).resolve().parent.parent.parent / ".env"

if env_path_root.exists():
    load_dotenv(dotenv_path=env_path_root)
elif env_path_backend.exists():
    load_dotenv(dotenv_path=env_path_backend)
else:
    load_dotenv()


class Settings(BaseModel):
    PROJECT_NAME: str = "Food Verse AI – Multimodal Food Intelligence Agent"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Database (SQLite by default, easily swapped with PostgreSQL URL)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./food_verse.db")
    
    # Uploads
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    MAX_UPLOAD_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB limit
    ALLOWED_IMAGE_TYPES: list[str] = ["image/jpeg", "image/png", "image/webp"]
    
    # AI / Multimodal Keys
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "") or os.getenv("GOOGLE_API_KEY", "")
    AI_MODEL_NAME: str = os.getenv("AI_MODEL_NAME", "gemini-1.5-flash")
    
    # Mode
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "yes")

    @property
    def has_ai_credentials(self) -> bool:
        return bool(self.GEMINI_API_KEY and len(self.GEMINI_API_KEY.strip()) > 10)


settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

