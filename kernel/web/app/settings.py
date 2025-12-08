import os
import json
from typing import cast


debug = os.getenv("DEBUG") == "true"

secret_key = os.environ["SECRET_KEY"]

database_url = os.environ["DATABASE_URL"]

allowed_origins = os.getenv("ALLOWED_ORIGINS", "[]")
allowed_origins = cast(list[str], json.loads(allowed_origins))
