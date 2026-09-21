from flask import Blueprint, abort, jsonify, request

from database import get_db
from models import Category

bp = Blueprint("categories", __name__)


def _to_dict(cat: Category) -> dict:
    return {"id": cat.id, "name": cat.name, "colour": cat.colour}


@bp.get("/")
def list_categories():
    """Return all categories sorted by name."""
    with get_db() as db:
        cats = db.query(Category).order_by(Category.name).all()
        return jsonify([_to_dict(c) for c in cats])


@bp.post("/")
def create_category():
    """Create a new category."""
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    if not name:
        abort(400, description="name is required")

    colour = data.get("colour", "#6366F1")

    with get_db() as db:
        if db.query(Category).filter(Category.name == name).first():
            abort(400, description="Category already exists")
        cat = Category(name=name, colour=colour)
        db.add(cat)
        db.commit()
        db.refresh(cat)
        return jsonify(_to_dict(cat)), 201


@bp.delete("/<int:category_id>")
def delete_category(category_id: int):
    """Delete a category by ID."""
    with get_db() as db:
        cat = db.get(Category, category_id)
        if not cat:
            abort(404, description="Category not found")
        db.delete(cat)
        db.commit()
        return "", 204
