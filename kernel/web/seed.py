from core.base import hasher
from core.db import init_db_engine
from sqlmodel import select, Session
from core.auth.account import Account


db_engine = init_db_engine()


with Session(db_engine) as db_session:
    email = "demo@leap360.com"

    account = db_session.exec(select(Account).where(
        Account.email == email
    )).first()

    if not account:
        account = Account.model_validate(dict(
            email=email,
            password=hasher.hash("password"),
        ))
        db_session.add(account)
        db_session.commit()
