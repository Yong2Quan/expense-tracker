import os
from contextlib import contextmanager
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

# Overridable so the test suite can point at a throwaway database.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./spending.db")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Context-managed database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
