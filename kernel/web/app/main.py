from fastapi import FastAPI
from app.router import router
from app.lifespan import lifespan
from app.middlewares import middlewares


app = FastAPI(lifespan=lifespan)

app.include_router(router)


for mw_class, mw_options in middlewares:
    app.add_middleware(mw_class, **mw_options)
