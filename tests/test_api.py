from unittest.mock import patch


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["llm_configured"] is False
    assert "provider_base_url" not in body
    assert body.get("model") is None


def test_chat_validation_empty(client):
    response = client.post("/api/chat", json={"message": "   "})
    assert response.status_code == 422


def test_generate_validation_language(client):
    response = client.post(
        "/api/generate",
        json={"requirements": "sort a list", "language": "brainfuck"},
    )
    assert response.status_code == 422


def test_chat_without_key_still_stores_conversation(client):
    response = client.post("/api/chat", json={"message": "Explain recursion"})
    assert response.status_code == 200
    body = response.json()
    assert body["ai_used"] is False
    assert body["setup_required"] is True
    conversation_id = body["conversation_id"]

    listed = client.get("/api/conversations")
    assert listed.status_code == 200
    ids = [item["id"] for item in listed.json()["conversations"]]
    assert conversation_id in ids

    detail = client.get(f"/api/conversations/{conversation_id}")
    assert detail.status_code == 200
    assert len(detail.json()["messages"]) == 2


def test_delete_conversation(client):
    created = client.post("/api/chat", json={"message": "hello"})
    conversation_id = created.json()["conversation_id"]
    deleted = client.delete(f"/api/conversations/{conversation_id}")
    assert deleted.status_code == 200
    missing = client.get(f"/api/conversations/{conversation_id}")
    assert missing.status_code == 404


def test_debug_python_syntax_without_ai(client):
    response = client.post(
        "/api/debug",
        json={"code": "def add(a, b\n    return a + b", "language": "python"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["analysis"]["syntax"]["ok"] is False
    assert body["ai_used"] is False


def test_review_flags_eval_without_ai(client):
    response = client.post(
        "/api/review",
        json={"code": "eval(user_input)", "language": "python"},
    )
    assert response.status_code == 200
    findings = response.json()["analysis"]["findings"]
    assert any("eval" in item["message"].lower() for item in findings)


def test_generate_with_mocked_ai(client):
    with patch("routes.code_tools.ai_service.chat", return_value="```python\nprint('hi')\n```"):
        response = client.post(
            "/api/generate",
            json={"requirements": "print hi", "language": "python"},
        )
    assert response.status_code == 200
    assert "print" in response.json()["reply"]


def test_explain_endpoint(client):
    response = client.post(
        "/api/explain",
        json={"code": "def add(a, b):\n    return a + b\n", "language": "python"},
    )
    assert response.status_code == 200
    assert response.json()["analysis"]["syntax"]["ok"] is True


def test_unknown_conversation(client):
    response = client.get("/api/conversations/99999")
    assert response.status_code == 404


def test_debug_rejects_unsupported_language(client):
    response = client.post(
        "/api/debug",
        json={"code": "int main() { return 0; }", "language": "brainfuck"},
    )
    assert response.status_code == 422


def test_refactor_without_key_returns_original(client):
    code = "def add(a, b):\n    return a + b\n"
    response = client.post(
        "/api/refactor",
        json={"code": code, "language": "python", "goals": ["readability"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["ai_used"] is False
    assert body["original_code"].strip() == code.strip()


def test_tests_endpoint_without_key(client):
    response = client.post(
        "/api/tests",
        json={"code": "def add(a, b):\n    return a + b\n", "language": "python"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["ai_used"] is False
    assert "test_add_typical" in (body.get("code") or "")


def test_generate_empty_requirements(client):
    response = client.post("/api/generate", json={"requirements": "  ", "language": "python"})
    assert response.status_code == 422
