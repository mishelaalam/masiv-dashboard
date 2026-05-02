"""
LLM route — interprets natural language building queries via Groq (free tier).
Model: llama-3.1-8b-instant (fast, free)
"""

import os
import json
from groq import Groq
from flask import Blueprint, jsonify, request

llm_bp = Blueprint("llm", __name__)

SYSTEM_PROMPT = """You are an urban data query engine for a Calgary 3D city dashboard.

The user will type a natural language query about buildings. Your ONLY job is to return
a JSON object describing filter rules. Do not add explanation or markdown — return raw JSON only.

Available building fields:
  - height_m       (float, metres)
  - assessed_value (int, CAD dollars)
  - use_type       (string): "Residential", "Commercial", "Office", "Hotel", "Industrial",
                             "Institutional", "Religious", "Parking", "Mixed Use", "Retail"
  - zoning         (string): e.g. "R-C2", "RC-G", "C-COR2", "CC-MHX", "CC-X", "I-B",
                             "S-SPR", "DC", "CC-MH", "C-N2"
  - levels         (int, number of floors)
  - year_built     (string, e.g. "1975" or "Unknown")
  - address        (string)
  - name           (string)

Return a JSON object with any of these optional keys:
{
  "height_min":    <number | null>,
  "height_max":    <number | null>,
  "value_min":     <number | null>,
  "value_max":     <number | null>,
  "use_types":     [<string>] | null,
  "zonings":       [<string>] | null,
  "year_min":      <number | null>,
  "year_max":      <number | null>,
  "levels_min":    <number | null>,
  "levels_max":    <number | null>,
  "name_contains": <string | null>,
  "description":   <string>
}

Examples:
  "show buildings over 100 metres"
  -> {"height_min": 100, "description": "Buildings taller than 100m"}

  "highlight commercial buildings worth less than $500,000"
  -> {"use_types": ["Commercial"], "value_max": 500000, "description": "Commercial buildings under $500,000"}

  "RC-G zoning"
  -> {"zonings": ["RC-G"], "description": "Buildings in RC-G zoning"}

  "reset" or "clear" or "show all"
  -> {"description": "Show all buildings"}
"""


@llm_bp.route("/query", methods=["POST"])
def query_buildings():
    body = request.get_json(silent=True) or {}
    user_query = (body.get("query") or "").strip()

    if not user_query:
        return jsonify({"error": "query field required"}), 400

    api_key = os.environ.get("GROQ_API_KEY", "")
    if not api_key:
        return jsonify({"error": "GROQ_API_KEY not configured in .env"}), 500

    try:
        client = Groq(api_key=api_key)
        chat = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": user_query},
            ],
            temperature=0.1,
            max_tokens=512,
        )

        raw = chat.choices[0].message.content.strip()

        # Strip accidental markdown fences
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        filter_obj = json.loads(raw)
        return jsonify({"filter": filter_obj, "raw_response": raw})

    except json.JSONDecodeError as exc:
        return jsonify({"error": f"LLM returned invalid JSON: {exc}", "raw": raw}), 502
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500