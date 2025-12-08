import jwt
from app import settings
from core.auth.base import AuthData
from pydantic import ValidationError
from sqlmodel import select, Session
from core.auth.account import Account
from fastapi import status, Request, HTTPException
from core.base import Message, GenericError, dump_error, is_dense_string


class AccessTokenError(Exception):
    pass


def parse_access_token(access_token: str, db_session: Session) -> (
    AuthData
):
    try:
        result = jwt.decode(
            access_token,
            settings.secret_key,
            algorithms=["HS256"],
            options=dict(require=["iat", "exp", "sub"]),
        )

        auth_data = AuthData(
            issued_at=result["iss"],
            expires_at=result["exp"],
            account_id=result["sub"],
        )

        if not db_session.exec(select(Account.id).where(
            Account.id == auth_data.account_id
        )).first():
            raise GenericError("No associated account record")

        return auth_data

    except (
        GenericError,
        ValidationError,
        jwt.exceptions.DecodeError,
        jwt.exceptions.InvalidTokenError,
    ) as error:
        context = (
            dict(pydantic_errors=error.json())
            if isinstance(error, ValidationError)
            else dump_error(error)
        )

        raise AccessTokenError(
            Message(
                context=context,
                code="invalid_access_token",
                summary="Invalid access token provided",
            )
        )


def authenticate(request: Request) -> AuthData:
    authorization = request.headers.get("authorization", str())
    access_token = authorization.strip("Bearer").lstrip()

    if (
        not authorization.startswith("Bearer")
        or not is_dense_string(access_token)
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=(
                Message(
                    code="invalid_authorization_header",
                    summary="Authorization header is Malformed",
                )
            ),
        )

    try:
        db_session = request.app.state.db_session
        return parse_access_token(access_token, db_session)

    except AccessTokenError as error:
        detail = error.args[0]
        status_code = status.HTTP_401_UNAUTHORIZED
        raise HTTPException(detail=detail, status_code=status_code)
