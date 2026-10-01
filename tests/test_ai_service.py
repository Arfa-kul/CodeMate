import httpx
import pytest

from services.ai_service import AINotConfiguredError, AIService, AIServiceError


class DummyResponse:
    def __init__(self, status_code, payload=None, text=""):
        self.status_code = status_code
        self._payload = payload
        self.text = text

    def json(self):
        if self._payload is None:
            raise ValueError("no json")
        return self._payload


class DummyClient:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error

    def __enter__(self):
        return self

    def __exit__(self, *args):
        return False

    def post(self, *args, **kwargs):
        if self.error:
            raise self.error
        return self.response


def test_ai_not_configured(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "")
    from config import get_settings

    get_settings.cache_clear()
    service = AIService()
    with pytest.raises(AINotConfiguredError):
        service.chat("sys", "hello")
    get_settings.cache_clear()


def test_ai_timeout(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    from config import get_settings

    get_settings.cache_clear()

    def fake_client(*args, **kwargs):
        return DummyClient(error=httpx.TimeoutException("timeout"))

    monkeypatch.setattr("services.ai_service.httpx.Client", fake_client)
    service = AIService()
    with pytest.raises(AIServiceError) as exc:
        service.chat("sys", "hello")
    assert exc.value.status_code == 504
    get_settings.cache_clear()


def test_ai_unauthorized(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    from config import get_settings

    get_settings.cache_clear()
    response = DummyResponse(401, {"error": {"message": "bad key"}})

    def fake_client(*args, **kwargs):
        return DummyClient(response=response)

    monkeypatch.setattr("services.ai_service.httpx.Client", fake_client)
    service = AIService()
    with pytest.raises(AIServiceError) as exc:
        service.chat("sys", "hello")
    assert exc.value.status_code == 401
    get_settings.cache_clear()


def test_ai_success(monkeypatch):
    monkeypatch.setenv("LLM_API_KEY", "test-key")
    from config import get_settings

    get_settings.cache_clear()
    response = DummyResponse(
        200,
        {"choices": [{"message": {"content": "  hello from model  "}}]},
    )

    def fake_client(*args, **kwargs):
        return DummyClient(response=response)

    monkeypatch.setattr("services.ai_service.httpx.Client", fake_client)
    service = AIService()
    assert service.chat("sys", "hello") == "hello from model"
    get_settings.cache_clear()
