from functools import lru_cache

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = Field(default="RadarTech API", min_length=1)

    # Para execução local, pode vir diretamente do DATABASE_URL no .env.
    database_url: str | None = None

    # Para Docker Compose, a URL é montada com estas variáveis.
    postgres_db: str | None = None
    postgres_user: str | None = None
    postgres_password: SecretStr | None = None
    db_host: str = Field(default="localhost", min_length=1)
    db_port: int = Field(default=5432, ge=1, le=65535)

    jwt_secret_key: str = "change-this-development-secret"
    access_token_expire_minutes: int = 60
    frontend_origins: str = (
        "http://localhost:4200,http://127.0.0.1:4200,"
        "http://localhost:8080,http://127.0.0.1:8080,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )

    @model_validator(mode="after")
    def configurar_database_url(self):
        if self.database_url:
            return self

        if not all((self.postgres_db, self.postgres_user, self.postgres_password)):
            raise ValueError(
                "Defina DATABASE_URL ou POSTGRES_DB, POSTGRES_USER e POSTGRES_PASSWORD"
            )

        self.database_url = URL.create(
            "postgresql+asyncpg",
            username=self.postgres_user,
            password=self.postgres_password.get_secret_value(),
            host=self.db_host,
            port=self.db_port,
            database=self.postgres_db,
        ).render_as_string(hide_password=False)

        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()