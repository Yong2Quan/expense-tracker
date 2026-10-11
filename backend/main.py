from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from database import Base, engine
from routers.categories import bp as categories_bp
from routers.expenses import bp as expenses_bp


def create_app() -> Flask:
    """Build the Flask app. A factory keeps the test suite independent."""
    Base.metadata.create_all(bind=engine)

    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(categories_bp, url_prefix="/categories")
    app.register_blueprint(expenses_bp, url_prefix="/expenses")

    @app.errorhandler(HTTPException)
    def handle_http_error(exc: HTTPException):
        """Return JSON errors, not HTML — the mobile client parses JSON."""
        return jsonify({"error": exc.description}), exc.code

    @app.get("/health")
    def health_check():
        """Liveness check."""
        return jsonify({"status": "ok"})

    return app


app = create_app()


if __name__ == "__main__":
    # host="0.0.0.0" so a phone on the same Wi-Fi can reach this,
    # not just localhost on this PC.
    app.run(host="0.0.0.0", port=8000, debug=True)
