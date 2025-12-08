from sqlmodel import (
    Field,
    Column,
    SQLModel,
    DateTime,
)
from typing import Any
from uuid import uuid4, UUID
from datetime import datetime
from pydantic import EmailStr
from sqlalchemy.sql import func


class Account(SQLModel, table=True):
    __tablename__: Any = "accounts"

    id: UUID = Field(
        nullable=False,
        primary_key=True,
        default_factory=uuid4,
    )

    email: EmailStr = Field(
        index=True,
        unique=True,
        nullable=False,
        min_length=1,
        max_length=255,
    )

    password: str = Field(
        min_length=60,
        max_length=60,
        nullable=False,
    )

    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
        ),
        default_factory=datetime.now,
    )

    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            onupdate=func.now(),
            server_default=func.now(),
        ),
        default_factory=datetime.now,
    )
