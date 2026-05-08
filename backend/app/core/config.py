from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):

    APP_NAME: str = "CutLink"
    DEBUG: bool = False
    DATABASE_URL: str
    REDIS_URL: str
    BASE_URL: str
    SHORT_CODE_LENGTH: int = 6
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str
    MINIO_SECURE: bool = False
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200
    MINIO_PUBLIC_URL: str

    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env"
    )


settings = Settings()