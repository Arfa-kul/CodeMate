"""OpenAI-compatible chat completions client used by every coding tool."""

from __future__ import annotations

import logging
from typing import Any

import httpx

from config import get_settings

logger = logging.getLogger(__name__)


class AIServiceError(Exception):
    def __init__(self, message: str, status_code: int = 502):
        super().__init__(message)
        self.status_code = status_code
        self.message = message


class AINotConfiguredError(AIServiceError):
    def __init__(self):
        super().__init__(
            "No LLM API key is configured. Set LLM_API_KEY in the backend .env file. "
            "Local static analysis still works without a key.",
            status_code=503,
        )


class AIService:
    def chat(
        self,
        system_prompt: str,
        user_prompt: str,
        history: list[dict[str, str]] | None = None,
    ) -> str:
        settings = get_settings()
        if not settings.llm_configured:
            raise AINotConfiguredError()

        messages: list[dict[str, str]] = [{"role": "system", "content": system_prompt}]
        if history:
            for item in history:
                role = item.get("role")
                content = item.get("content")
                if role in {"user", "assistant"} and content:
                    messages.append({"role": role, "content": content})
        messages.append({"role": "user", "content": user_prompt})

        url = settings.llm_base_url.rstrip("/") + "/chat/completions"
        payload: dict[str, Any] = {
            "model": settings.llm_model,
            "messages": messages,
            "temperature": 0.2,
        }
        headers = {
            "Authorization": f"Bearer {settings.llm_api_key}",
            "Content-Type": "application/json",
        }

        try:
            with httpx.Client(timeout=settings.llm_timeout_seconds) as client:
                response = client.post(url, json=payload, headers=headers)
        except httpx.TimeoutException as exc:
            raise AIServiceError("The language model timed out. Try a smaller snippet.", 504) from exc
        except httpx.RequestError as exc:
            logger.warning("LLM request failed: %s", exc)
            raise AIServiceError("Could not reach the language model provider.", 502) from exc

        if response.status_code == 401:
            raise AIServiceError("The language model rejected the API key.", 401)
        if response.status_code == 429:
            raise AIServiceError("The language model rate-limited this request. Wait and retry.", 429)
        if response.status_code >= 400:
            detail = _safe_error_body(response)
            raise AIServiceError(f"Language model error ({response.status_code}): {detail}", 502)

        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, ValueError, TypeError) as exc:
            raise AIServiceError("The language model returned an unexpected response.", 502) from exc

        if not content or not str(content).strip():
            raise AIServiceError("The language model returned an empty reply.", 502)
        return str(content).strip()


def _safe_error_body(response: httpx.Response) -> str:
    try:
        payload = response.json()
        error = payload.get("error")
        if isinstance(error, dict):
            return str(error.get("message") or error)[:400]
        if isinstance(error, str):
            return error[:400]
        return str(payload)[:400]
    except ValueError:
        return response.text[:400]


ai_service = AIService()


def setup_payload() -> dict:
    settings = get_settings()
    return {
        "setup_required": not settings.llm_configured,
        "llm_configured": settings.llm_configured,
        "model": settings.llm_model if settings.llm_configured else None,
        "message": None
        if settings.llm_configured
        else (
            "AI features need LLM_API_KEY in the backend environment. "
            "Copy .env.example to .env, add a key from an OpenAI-compatible provider, "
            "and restart the backend. Local code analysis still works."
        ),
    }
