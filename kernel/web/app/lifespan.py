from fastapi import FastAPI
from core.db import init_db_engine
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    app.state.db_engine = init_db_engine()
    yield
