import pytest
from pydantic import ValidationError

from app.core.config import Settings


@pytest.mark.parametrize("overrides", [
    {"db_port": 0}, {"db_port": 65536}, {"postgres_password": ""},
    {"postgres_db": ""}, {"postgres_user": ""}, {"db_host": ""},
])
def test_reject_invalid_settings(overrides):
    values = {"postgres_db": "test", "postgres_user": "test", "postgres_password": "test"}
    values.update(overrides)
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **values)


def test_password_is_secret_and_url_handles_special_characters():
    password = "secret@:/%#"
    settings = Settings(
        _env_file=None, postgres_db="test", postgres_user="test", postgres_password=password,
    )
    assert password not in repr(settings)
    assert password not in str(settings.database_url)
    assert settings.database_url.password == password
