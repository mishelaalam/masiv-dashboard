"""
MASIV 2025 Intern Test — Urban Design 3D City Dashboard
Backend: Flask API with SQLite persistence and Anthropic LLM integration
"""

from flask import Flask
from flask_cors import CORS
from database import init_db
from routes.buildings import buildings_bp
from routes.projects import projects_bp
from routes.llm import llm_bp

def create_app():
    app = Flask(__name__)
    CORS(app, origins="*")

    init_db()

    app.register_blueprint(buildings_bp, url_prefix="/api/buildings")
    app.register_blueprint(projects_bp, url_prefix="/api/projects")
    app.register_blueprint(llm_bp, url_prefix="/api/llm")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "MASIV Dashboard API running"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
