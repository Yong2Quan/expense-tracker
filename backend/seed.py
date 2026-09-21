"""
Seed default categories into the backend database.
Run once after starting the API: python seed.py
"""

import sys
from datetime import date

import requests

BASE_URL = "http://localhost:8000"

DEFAULT_CATEGORIES = [
    {"name": "Food & Drink", "colour": "#F59E0B"},
    {"name": "Transport", "colour": "#3B82F6"},
    {"name": "Shopping", "colour": "#EC4899"},
    {"name": "Entertainment", "colour": "#8B5CF6"},
    {"name": "Health", "colour": "#10B981"},
    {"name": "Bills", "colour": "#EF4444"},
]


def seed_categories() -> None:
    """POST each default category; skip if it already exists (400)."""
    print("Seeding categories...")
    for cat in DEFAULT_CATEGORIES:
        response = requests.post(f"{BASE_URL}/categories/", json=cat, timeout=5)
        if response.status_code == 201:
            print(f"  + Created: {cat['name']}")
        elif response.status_code == 400:
            print(f"  ~ Already exists: {cat['name']}")
        else:
            print(f"  ! Unexpected {response.status_code} for {cat['name']}: {response.text}")
            sys.exit(1)


if __name__ == "__main__":
    try:
        requests.get(f"{BASE_URL}/health", timeout=3)
    except requests.ConnectionError:
        print("ERROR: FastAPI server is not running. Start it first with:")
        print("  uvicorn main:app --reload")
        sys.exit(1)

    seed_categories()
    print("\nDone. Your backend is ready.")
