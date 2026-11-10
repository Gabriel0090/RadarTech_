from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.api import api_router
from app.core.config import get_settings
from app.database import engine

settings = get_settings()

app = FastAPI(
    title="Radar Tech API",
    version="0.2.0",
    description="API para consultar e administrar oportunidades de tecnologia.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.frontend_origins.split(",") if origin.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health", tags=["health"])
async def health_check():
    """Confirma que o processo da API está ativo."""
    return {"status": "ok"}


@app.get("/ready", tags=["health"])
async def readiness_check():
    """Confirma que a API consegue consultar o PostgreSQL."""
    try:
        async with engine.connect() as connection:
            await connection.execute(text("SELECT 1"))
    except SQLAlchemyError as exc:
        raise HTTPException(status_code=503, detail="Banco de dados indisponível") from exc

    return {"status": "ready", "database": "ok"}
