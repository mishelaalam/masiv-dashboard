"""Projects route — save / load named filter sets per user."""

import json
from flask import Blueprint, jsonify, request
from database import get_or_create_user, save_project, load_projects, delete_project

projects_bp = Blueprint("projects", __name__)


@projects_bp.route("/user", methods=["POST"])
def upsert_user():
    """Create or retrieve a user by username."""
    body = request.get_json(silent=True) or {}
    username = (body.get("username") or "").strip()
    if not username:
        return jsonify({"error": "username required"}), 400
    user = get_or_create_user(username)
    return jsonify(user)


@projects_bp.route("/<int:user_id>", methods=["GET"])
def list_projects(user_id: int):
    """Return all saved projects for a user."""
    projects = load_projects(user_id)
    # Deserialize filter_json for convenience
    for p in projects:
        try:
            p["filter"] = json.loads(p["filter_json"])
        except Exception:
            p["filter"] = {}
    return jsonify({"projects": projects})


@projects_bp.route("/<int:user_id>", methods=["POST"])
def create_project(user_id: int):
    """Save a new project (filter set + query text)."""
    body = request.get_json(silent=True) or {}
    name       = (body.get("name") or "").strip()
    query_text = (body.get("query_text") or "").strip()
    filter_obj = body.get("filter", {})

    if not name:
        return jsonify({"error": "project name required"}), 400

    project = save_project(
        user_id=user_id,
        name=name,
        query_text=query_text,
        filter_json=json.dumps(filter_obj),
    )
    project["filter"] = filter_obj
    return jsonify(project), 201


@projects_bp.route("/<int:user_id>/<int:project_id>", methods=["DELETE"])
def remove_project(user_id: int, project_id: int):
    """Delete a project owned by the user."""
    deleted = delete_project(project_id, user_id)
    if deleted:
        return jsonify({"deleted": True})
    return jsonify({"error": "not found"}), 404
