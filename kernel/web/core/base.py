import re
from typing import Any
from dataclasses import field
from core.record import Record
from passlib.context import CryptContext
from pydantic import Field, BaseModel, ConfigDict


hasher = CryptContext(schemes=["bcrypt"])


def is_dense_string(value: Any) -> bool:
    return (
        isinstance(value, str)
        and bool(re.fullmatch(r"[^\s]+", value))
    )


def dump_error(error: Exception) -> dict[str, str]:
    return dict(
        error_type=error.__class__.__name__,
        error_message=str(error),
    )


class GenericError(Exception):
    pass


class Message(Record):
    code: str
    summary: str
    description: str | None = None
    context: dict[str, Any] = field(default_factory=dict)


class ClientPayload[TData](BaseModel):
    data: TData | None = None
    warnings: list[Message] = Field(default_factory=list)
    failures: list[Message] = Field(default_factory=list)

    model_config = ConfigDict(arbitrary_types_allowed=True)
