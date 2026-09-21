from flask import Flask, jsonify
from flask_cors import CORS

from database import Base, engine
from routers.categories import bp as categories_bp
from routers.expenses import bp as expenses_bp

Base.metadata.create_all(bind=engine)

app = Flask(__name__)
CORS(app)

app.register_blueprint(categories_bp, url_prefix="/categories")
app.register_blueprint(expenses_bp, url_prefix="/expenses")


@app.get("/health")
def health_check():
    """Liveness check."""
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(port=8000, debug=True)
