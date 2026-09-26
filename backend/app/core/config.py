import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicShield AI"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    SECRET_KEY: str = "civicshield_secret_key_fyp_2026_super_secure_jwt_token_key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # SQLite default database path, can be overridden with Postgres URL via env
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civicshield.db")
    
    # Optional Gemini / Vision API key
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Uploads directory
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")

    class Config:
        case_sensitive = True

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "original"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "resolution"), exist_ok=True)
