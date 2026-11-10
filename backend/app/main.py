from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.health import router
from app.core.config import get_settings
from app.db.session import engine


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        yield
    finally:
        await engine.dispose()


app = FastAPI(title=get_settings().app_name, lifespan=lifespan)
app.include_router(router)
