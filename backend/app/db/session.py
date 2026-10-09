from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# ---------------------------------------------------------------------------
# Engine configuration
# SQLite: single-thread safety flag required
# PostgreSQL: connection pooling for production concurrency
# ---------------------------------------------------------------------------
_is_sqlite = settings.DATABASE_URL.startswith("sqlite")

engine_kwargs: dict = {}
if _is_sqlite:
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    # PostgreSQL production settings suitable for Railway's container limits
    engine_kwargs["pool_pre_ping"] = True   # Detect stale connections
    engine_kwargs["pool_size"] = 5          # Keep 5 persistent connections
    engine_kwargs["max_overflow"] = 10      # Allow up to 10 extra under load
    engine_kwargs["pool_recycle"] = 300     # Recycle connections every 5 min
    engine_kwargs["connect_args"] = {"connect_timeout": 10}

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """FastAPI dependency: yields a DB session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
