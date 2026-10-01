import os
from pathlib import Path

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_file = tmp_path / "test.db"
    monkeypatch.setenv("DATABASE_PATH", str(db_file))
    monkeypatch.setenv("LLM_API_KEY", "")
    monkeypatch.setenv("LLM_MODEL", "test-model")
    monkeypatch.setenv("LLM_BASE_URL", "https://example.invalid/v1")

    from config import get_settings

    get_settings.cache_clear()

    from database import init_db
    from main import app

    init_db()
    with TestClient(app) as test_client:
        yield test_client

    get_settings.cache_clear()
    Path(db_file).unlink(missing_ok=True)
