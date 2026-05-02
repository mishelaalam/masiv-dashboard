"""Buildings route — serves the 3D building dataset to the frontend."""

from flask import Blueprint, jsonify, request
from services.buildings import get_buildings

buildings_bp = Blueprint("buildings", __name__)


@buildings_bp.route("/", methods=["GET"])
def list_buildings():
    force = request.args.get("refresh", "false").lower() == "true"
    try:
        buildings = get_buildings(force_refresh=force)
        return jsonify({"buildings": buildings, "count": len(buildings)})
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500
