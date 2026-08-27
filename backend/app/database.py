from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=5,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# One-time check for vector extension in PostgreSQL
HAS_DB_VECTOR = False
try:
    # Use temporary connection to query pg_extension
    with engine.connect() as conn:
        from sqlalchemy import text
        row = conn.execute(text("SELECT extname FROM pg_extension WHERE extname='vector'")).fetchone()
        HAS_DB_VECTOR = row is not None
except Exception:
    HAS_DB_VECTOR = False


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

