from datetime import date as date_cls

from flask import Blueprint, abort, jsonify, request

from database import get_db
from models import Category, Expense

bp = Blueprint("expenses", __name__)


def _to_dict(exp: Expense) -> dict:
    return {
        "id": exp.id,
        "amount": exp.amount,
        "note": exp.note,
        "date": exp.date.isoformat(),
        "category_id": exp.category_id,
        "category": {
            "id": exp.category.id,
            "name": exp.category.name,
            "colour": exp.category.colour,
        },
    }


@bp.get("/")
def list_expenses():
    """Return all expenses, newest first."""
    with get_db() as db:
        expenses = db.query(Expense).order_by(Expense.date.desc()).all()
        return jsonify([_to_dict(e) for e in expenses])


@bp.post("/")
def create_expense():
    """Create a new expense."""
    data = request.get_json(silent=True) or {}

    try:
        amount = float(data["amount"])
        if amount <= 0:
            raise ValueError
    except (KeyError, ValueError, TypeError):
        abort(400, description="amount must be a positive number")

    raw_date = str(data.get("date") or "").strip()
    if not raw_date:
        abort(400, description="date is required (YYYY-MM-DD)")
    try:
        # SQLAlchemy's Date column needs a real date object, not a string.
        expense_date = date_cls.fromisoformat(raw_date)
    except ValueError:
        abort(400, description="date must be in YYYY-MM-DD format")

    try:
        category_id = int(data["category_id"])
    except (KeyError, ValueError, TypeError):
        abort(400, description="category_id is required and must be an integer")

    with get_db() as db:
        if not db.get(Category, category_id):
            abort(404, description="Category not found")

        expense = Expense(
            amount=amount,
            note=(data.get("note") or None),
            date=expense_date,
            category_id=category_id,
        )
        db.add(expense)
        db.commit()
        db.refresh(expense)
        return jsonify(_to_dict(expense)), 201


@bp.delete("/<int:expense_id>")
def delete_expense(expense_id: int):
    """Delete an expense by ID."""
    with get_db() as db:
        expense = db.get(Expense, expense_id)
        if not expense:
            abort(404, description="Expense not found")
        db.delete(expense)
        db.commit()
        return "", 204
