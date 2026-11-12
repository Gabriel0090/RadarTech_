"""Ciclo destrutivo permitido apenas no PostgreSQL efêmero do Compose de testes."""
import asyncio
import os
import subprocess
import sys

from sqlalchemy import inspect
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings


async def assert_empty():
    engine = create_async_engine(get_settings().database_url)
    try:
        async with engine.connect() as connection:
            tables = await connection.run_sync(lambda c: inspect(c).get_table_names())
            if set(tables) - {"alembic_version"}:
                raise RuntimeError("Banco não está vazio; nenhuma migration será aplicada")
    finally:
        await engine.dispose()


def run(*args):
    subprocess.run([sys.executable, *args], check=True)


if __name__ == "__main__":
    if os.getenv("RADARTECH_TEST") != "1" or get_settings().postgres_db != "radartech_test":
        raise RuntimeError("Use exclusivamente o Compose de testes")
    asyncio.run(assert_empty())
    run("-m", "alembic", "upgrade", "head")
    run("-m", "alembic", "check")
    run("-m", "pytest", "-v")
    run("-m", "alembic", "downgrade", "base")
    asyncio.run(assert_empty())
    run("-m", "alembic", "upgrade", "head")
    run("-m", "alembic", "check")
