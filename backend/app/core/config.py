import os
from typing import List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator


class Settings(BaseSettings):
    ENVIRONMENT: str = "production"
    APP_NAME: str = "Healthcare AI Platform"
    # DEBUG is False by default in production; set DEBUG=true in local .env
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # -----------------------------------------------------------------------
    # Security — MUST be overridden via environment variable in production
    # -----------------------------------------------------------------------
    SECRET_KEY: str = "healthcare_ai_super_secret_development_key_change_in_production_min32chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # -----------------------------------------------------------------------
    # Database
    # Railway provides DATABASE_URL as a PostgreSQL URL automatically when
    # you add a Postgres plugin.  Falls back to SQLite for local dev.
    # -----------------------------------------------------------------------
    DATABASE_URL: str = "sqlite:///./healthcare_ai.db"

    # -----------------------------------------------------------------------
    # CORS — comma-separated list accepted, e.g.:
    #   CORS_ORIGINS=https://my-frontend.up.railway.app,http://localhost:5173
    # -----------------------------------------------------------------------
    CORS_ORIGINS: Union[str, List[str]] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ]

    # -----------------------------------------------------------------------
    # External APIs (all optional — features degrade gracefully without them)
    # -----------------------------------------------------------------------
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GOOGLE_VISION_API_KEY: str = ""
    GOOGLE_PLACES_API_KEY: str = ""

    # -----------------------------------------------------------------------
    # File Uploads
    # -----------------------------------------------------------------------
    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "..",
        "uploads",
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://localhost:3000"]

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_postgres_url(cls, v: str) -> str:
        """
        Railway (and Heroku) provide postgres:// URLs but SQLAlchemy 2.x
        requires postgresql://.  This validator fixes that automatically.
        """
        if isinstance(v, str) and v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql://", 1)
        return v


settings = Settings()
