from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

try:
    from dotenv import load_dotenv

    load_dotenv()
except Exception:
    pass

BASE_DIR = Path(__file__).resolve().parent
DEV_SECRET = "dev-only-secret-change-me"


def _flag(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


@dataclass(frozen=True)
class Settings:
    database_url: str
    jwt_secret: str
    environment: str
    cors_origins: tuple[str, ...]
    access_token_minutes: int
    rate_limit_enabled: bool
    seed_demo: bool
    model_dir: Path
    dataset_path: Path
    emergency_config_path: Path

    @property
    def is_production(self) -> bool:
        return self.environment.lower() == "production"


def _default_dataset_path() -> Path:
    candidates = [
        BASE_DIR.parent.parent / "dataset" / "emotion_training.csv",
        BASE_DIR.parent / "dataset" / "emotion_training.csv",
    ]
    for path in candidates:
        if path.exists():
            return path
    return candidates[0]


def load_settings() -> Settings:
    environment = os.getenv("ENVIRONMENT", "development")
    secret = os.getenv("JWT_SECRET", DEV_SECRET)
    if environment.lower() == "production" and secret == DEV_SECRET:
        raise RuntimeError("JWT_SECRET must be set when ENVIRONMENT=production")
    origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
    return Settings(
        database_url=os.getenv(
            "DATABASE_URL", "postgresql+psycopg2://sereneai:sereneai@localhost:5432/sereneai"
        ),
        jwt_secret=secret,
        environment=environment,
        cors_origins=tuple(o.strip() for o in origins.split(",") if o.strip()),
        access_token_minutes=int(os.getenv("ACCESS_TOKEN_MINUTES", "720")),
        rate_limit_enabled=_flag("RATE_LIMIT_ENABLED", True),
        seed_demo=_flag("SEED_DEMO", environment.lower() != "production"),
        model_dir=Path(os.getenv("MODEL_DIR", BASE_DIR / "ml" / "model")),
        dataset_path=Path(os.getenv("DATASET_PATH", _default_dataset_path())),
        emergency_config_path=Path(
            os.getenv("EMERGENCY_CONFIG_PATH", BASE_DIR / "data" / "emergency_numbers.json")
        ),
    )


settings = load_settings()
