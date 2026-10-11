"""
Seed default categories into the backend database.

Start the API first, then run once:
    python main.py      # terminal 1
    python seed.py      # terminal 2
"""

import json
import sys
import urllib.error
import urllib.request

BASE_URL = "http://localhost:8000"

# Colours come from the validated categorical palette in mobile/src/theme.ts.
# Keep the two in sync: that set is checked so no two categories become hard to
# tell apart for colourblind users.
DEFAULT_CATEGORIES = [
    {"name": "Food & Drink", "colour": "#eb6834"},
    {"name": "Transport", "colour": "#2a78d6"},
    {"name": "Shopping", "colour": "#e87ba4"},
    {"name": "Entertainment", "colour": "#6250d6"},
    {"name": "Health", "colour": "#1baf7a"},
    {"name": "Bills", "colour": "#e34948"},
]


def post_category(cat: dict) -> int:
    """POST one category; return the HTTP status code."""
    req = urllib.request.Request(
        f"{BASE_URL}/categories/",
        data=json.dumps(cat).encode(),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as response:
            return response.status
    except urllib.error.HTTPError as exc:
        return exc.code


def seed_categories() -> None:
    """POST each default category; skip if it already exists (400)."""
    print("Seeding categories...")
    for cat in DEFAULT_CATEGORIES:
        status = post_category(cat)
        if status == 201:
            print(f"  + Created: {cat['name']}")
        elif status == 400:
            print(f"  ~ Already exists: {cat['name']}")
        else:
            print(f"  ! Unexpected {status} for {cat['name']}")
            sys.exit(1)


if __name__ == "__main__":
    try:
        urllib.request.urlopen(f"{BASE_URL}/health", timeout=3)
    except (urllib.error.URLError, OSError):
        print("ERROR: The Flask server is not running. Start it first with:")
        print("  python main.py")
        sys.exit(1)

    seed_categories()
    print("\nDone. Your backend is ready.")
