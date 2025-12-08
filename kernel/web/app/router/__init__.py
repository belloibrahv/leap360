from app.router import auth
from fastapi import APIRouter

#--------------------------------------------
# API V1 Router
#--------------------------------------------

api_v1_router = APIRouter(prefix="/api/v1")

api_v1_router.include_router(auth.router)

#--------------------------------------------
# Router
#--------------------------------------------

router = APIRouter(redirect_slashes=False)

router.include_router(api_v1_router)
