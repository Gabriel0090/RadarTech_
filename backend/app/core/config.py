from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configurações lidas do ambiente e, em desenvolvimento, do arquivo .env."""

    database_url: str = "postgresql+asyncpg://usuario:senha@localhost:5432/radar_tech"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
