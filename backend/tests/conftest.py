import os

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

# Valores apenas para importar a aplicação nos testes sem banco.
os.environ.setdefault("POSTGRES_DB", "radartech_test")
os.environ.setdefault("POSTGRES_USER", "radartech_test")
os.environ.setdefault("POSTGRES_PASSWORD", "test_local")

from app.core.config import get_settings


@pytest_asyncio.fixture
async def db_session():
    if os.getenv("RADARTECH_TEST") != "1":
        pytest.skip("Use compose.test.yaml para PostgreSQL isolado")
    settings = get_settings()
    if settings.postgres_db != "radartech_test":
        pytest.fail("Os testes de integração exigem radartech_test")
    engine = create_async_engine(settings.database_url)
    try:
        async with engine.connect() as connection:
            transaction = await connection.begin()
            factory = async_sessionmaker(
                connection, expire_on_commit=False, join_transaction_mode="create_savepoint",
            )
            async with factory() as session:
                yield session
            await transaction.rollback()
    finally:
        await engine.dispose()
