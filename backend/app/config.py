from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres@127.0.0.1:5433/normai"
    JWT_SECRET: str = "normai-sih-2026-super-secret-jwt-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    EMBEDDING_MODEL: str = "models/text-embedding-004"
    UPLOAD_DIRECTORY: str = "./storage/uploads"
    GENERATED_DIRECTORY: str = "./storage/generated"
    MAX_UPLOAD_SIZE_MB: int = 25
    FRONTEND_ORIGIN: str = "http://localhost:3000"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    DEBUG: bool = True

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
