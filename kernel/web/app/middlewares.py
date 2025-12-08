from typing import Any
from app import settings
from fastapi.middleware.cors import CORSMiddleware


middlewares: list[tuple[type[Any], dict[str, Any]]] = [
    (
        CORSMiddleware,
        dict(
            allow_headers=["*"],
            allow_credentials=True,
            allow_origins=settings.allowed_origins,
            allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
        ),
    ),
]
