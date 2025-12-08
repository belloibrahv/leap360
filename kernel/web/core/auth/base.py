from uuid import UUID
from pydantic import BaseModel


class AuthData(BaseModel):
    issued_at: int
    expires_at: int
    account_id: UUID
