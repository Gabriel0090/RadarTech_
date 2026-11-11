from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações da API carregadas do ambiente ou do arquivo .env."""

    database_url: str = "postgresql+asyncpg://usuario:senha@localhost:5432/radar_tech"
    jwt_secret_key: str = "change-this-development-secret"
    access_token_expire_minutes: int = 60
    frontend_origins: str = (
        "http://localhost:4200,http://127.0.0.1:4200,"
        "http://localhost:8080,http://127.0.0.1:8080"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
