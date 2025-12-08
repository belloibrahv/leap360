import jwt
from app import settings
from sqlmodel import select, Session
from core.base import Message, hasher
from core.auth.account import Account
from datetime import datetime, timezone, timedelta


class InvalidCredentialsError(Exception):
    def __init__(self) -> None:
        super().__init__(
            Message(
                code="invalid_credentials",
                summary="Invalid credentials provided",
            )
        )


def login(*, email: str, password: str, db_session: Session) -> str:
    account = db_session.exec(
        select(Account)
        .where(Account.email == email)
    ).first()

    if not account or not hasher.verify(password, account.password):
        raise InvalidCredentialsError()

    issued_at = datetime.now(timezone.utc)
    expires_at = issued_at + timedelta(hours=24)

    claims = dict(iat=issued_at, exp=expires_at, sub=str(account.id))

    return jwt.encode(claims, settings.secret_key, algorithm="HS256")
