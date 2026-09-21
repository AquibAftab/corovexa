import os
from pathlib import Path
from dotenv import load_dotenv

# Walk upward from this file to find .env (supports running from backend/ or corovexa/)
_env_search = Path(__file__).resolve().parent
for _dir in [_env_search] + list(_env_search.parents):
    _candidate = _dir / ".env"
    if _candidate.exists():
        load_dotenv(_candidate)
        break
else:
    load_dotenv()  # fallback: default dotenv search


class Settings:
    # --- MongoDB / JWT (existing) ---
    MONGODB_URI = os.getenv("MONGODB_URI", "")
    JWT_SECRET = os.getenv("JWT_SECRET", "")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

    # --- AWS S3 Telemetry ---
    AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
    S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "")
    S3_PREFIX = os.getenv("S3_PREFIX", "sensor-data/")


settings = Settings()
