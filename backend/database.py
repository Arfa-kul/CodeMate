"""SQLite persistence for conversations. Secrets are never stored here."""

import sqlite3
from contextlib import contextmanager
from datetime import datetime, timezone
from pathlib import Path

from config import get_settings


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_db_path() -> Path:
    path = Path(get_settings().database_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


@contextmanager
def db_session():
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    with db_session() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id INTEGER NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_messages_conversation
            ON messages(conversation_id);
            """
        )


def create_conversation(title: str = "New conversation") -> dict:
    with db_session() as conn:
        cursor = conn.execute(
            "INSERT INTO conversations (title, created_at) VALUES (?, ?)",
            (title[:120], utc_now()),
        )
        conversation_id = cursor.lastrowid
        row = conn.execute(
            "SELECT id, title, created_at FROM conversations WHERE id = ?",
            (conversation_id,),
        ).fetchone()
        return dict(row)


def list_conversations() -> list[dict]:
    with db_session() as conn:
        rows = conn.execute(
            """
            SELECT c.id, c.title, c.created_at,
                   (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) AS message_count
            FROM conversations c
            ORDER BY c.created_at DESC
            """
        ).fetchall()
        return [dict(row) for row in rows]


def get_conversation(conversation_id: int) -> dict | None:
    with db_session() as conn:
        conversation = conn.execute(
            "SELECT id, title, created_at FROM conversations WHERE id = ?",
            (conversation_id,),
        ).fetchone()
        if conversation is None:
            return None
        messages = conn.execute(
            """
            SELECT id, role, content, created_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY id ASC
            """,
            (conversation_id,),
        ).fetchall()
        result = dict(conversation)
        result["messages"] = [dict(message) for message in messages]
        return result


def delete_conversation(conversation_id: int) -> bool:
    with db_session() as conn:
        cursor = conn.execute("DELETE FROM conversations WHERE id = ?", (conversation_id,))
        return cursor.rowcount > 0


def add_message(conversation_id: int, role: str, content: str) -> dict:
    with db_session() as conn:
        existing = conn.execute(
            "SELECT id FROM conversations WHERE id = ?",
            (conversation_id,),
        ).fetchone()
        if existing is None:
            raise ValueError("Conversation not found")
        cursor = conn.execute(
            """
            INSERT INTO messages (conversation_id, role, content, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (conversation_id, role, content, utc_now()),
        )
        if role == "user":
            current = conn.execute(
                "SELECT title FROM conversations WHERE id = ?",
                (conversation_id,),
            ).fetchone()
            if current and current["title"] in {"New conversation", "New chat"}:
                conn.execute(
                    "UPDATE conversations SET title = ? WHERE id = ?",
                    (content.strip()[:80] or "New conversation", conversation_id),
                )
        row = conn.execute(
            "SELECT id, conversation_id, role, content, created_at FROM messages WHERE id = ?",
            (cursor.lastrowid,),
        ).fetchone()
        return dict(row)
