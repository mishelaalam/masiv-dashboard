"""
Database layer — SQLite via Python's built-in sqlite3.
Tables:
  users    — simple username registry (no passwords required per brief)
  projects — saved filter configurations per user
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "masiv.db")


def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            username  TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id     INTEGER NOT NULL REFERENCES users(id),
            name        TEXT NOT NULL,
            query_text  TEXT NOT NULL,
            filter_json TEXT NOT NULL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


def get_or_create_user(username: str) -> dict:
    conn = get_conn()
    c = conn.cursor()
    c.execute("INSERT OR IGNORE INTO users (username) VALUES (?)", (username,))
    conn.commit()
    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    row = c.fetchone()
    conn.close()
    return dict(row)


def save_project(user_id: int, name: str, query_text: str, filter_json: str) -> dict:
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        """INSERT INTO projects (user_id, name, query_text, filter_json)
           VALUES (?, ?, ?, ?)""",
        (user_id, name, query_text, filter_json),
    )
    conn.commit()
    project_id = c.lastrowid
    c.execute("SELECT * FROM projects WHERE id = ?", (project_id,))
    row = c.fetchone()
    conn.close()
    return dict(row)


def load_projects(user_id: int) -> list:
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC",
        (user_id,),
    )
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]


def delete_project(project_id: int, user_id: int) -> bool:
    conn = get_conn()
    c = conn.cursor()
    c.execute(
        "DELETE FROM projects WHERE id = ? AND user_id = ?",
        (project_id, user_id),
    )
    affected = c.rowcount
    conn.commit()
    conn.close()
    return affected > 0
