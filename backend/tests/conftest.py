"""
Shared test fixtures.

database.py builds its engine at import time from DATABASE_URL, so we must
point that at a throwaway file BEFORE importing the app. This guarantees the
suite never touches your real spending.db.
"""

import os
import sys
import tempfile
from pathlib import Path

_TMP_DB = Path(tempfile.mkdtemp(prefix="expense-tests-")) / "test.db"
os.environ["DATABASE_URL"] = f"sqlite:///{_TMP_DB.as_posix()}"

# Make the backend package importable when pytest runs from the repo root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import pytest  # noqa: E402

from database import Base, engine  # noqa: E402
from main import create_app  # noqa: E402


@pytest.fixture()
def client():
    """A Flask test client backed by a fresh, empty database per test."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    app = create_app()
    app.config.update(TESTING=True)
    with app.test_client() as test_client:
        yield test_client

    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def category(client):
    """A single saved category, for tests that need something to attach to."""
    response = client.post("/categories/", json={"name": "Food", "colour": "#F59E0B"})
    assert response.status_code == 201
    return response.get_json()
