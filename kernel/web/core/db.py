from app import settings
from fastapi import Request
from sqlalchemy import Engine
from collections.abc import Iterator
from sqlmodel import Session, SQLModel, create_engine


def init_db_engine() -> Engine:
    from core.auth.account import Account as Account

    echo = settings.debug
    url = settings.database_url

    engine = create_engine(url, echo=echo)
    SQLModel.metadata.create_all(engine)

    return engine


def get_db_session(request: Request) -> Iterator[Session]:
    with Session(request.app.state.db_engine) as session:
        yield session
