from sqlmodel import Session
from pydantic import EmailStr
from fastapi import APIRouter
from core.db import get_db_session
from core.base import ClientPayload
from typing import Annotated, TypedDict
from fastapi import status, Body, Depends, Response
from core.auth.login import login, InvalidCredentialsError


router = APIRouter()


class LoginResBodyData(TypedDict):
    access_token: str


@router.post("/login")
def login_handler(
    response: Response,
    email: Annotated[EmailStr, Body(embed=True)],
    password: Annotated[str, Body(embed=True, min_length=1)],
    db_session: Annotated[Session, Depends(get_db_session)],
) -> (
    ClientPayload[LoginResBodyData]
):
    try:
        access_token = login(
            email=email,
            password=password,
            db_session=db_session,
        )

        return ClientPayload(data=LoginResBodyData(
            access_token=access_token
        ))

    except InvalidCredentialsError as error:
        response.status_code = status.HTTP_401_UNAUTHORIZED
        return ClientPayload(failures=[error.args[0]])
