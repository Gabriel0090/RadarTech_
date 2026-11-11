from unittest.mock import AsyncMock

from asyncpg import InvalidPasswordError
import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.exc import OperationalError

from app.db.session import get_session
from app.main import app


@pytest.mark.asyncio
async def test_health_and_docs():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json() == {"status": "ok"}
        assert (await client.get("/docs")).status_code == 200
        assert "/health/db" in (await client.get("/openapi.json")).json()["paths"]


@pytest.mark.parametrize("error", [
    OperationalError("SELECT 1", {}, Exception("senha_secreta")),
    OSError("senha_secreta"),
    TimeoutError("senha_secreta"),
    InvalidPasswordError("senha_secreta"),
])
async def test_db_unavailable_hides_internal_details(error):
    session = AsyncMock()
    session.execute.side_effect = error

    async def unavailable_session():
        yield session

    app.dependency_overrides[get_session] = unavailable_session
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/health/db")
        assert response.status_code == 503
        assert response.json() == {"detail": "Banco de dados indisponível"}
    finally:
        app.dependency_overrides.clear()
