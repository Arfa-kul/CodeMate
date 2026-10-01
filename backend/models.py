"""Pydantic request and response models with size limits."""

from typing import Literal

from pydantic import BaseModel, Field, field_validator

from config import get_settings


SUPPORTED_LANGUAGES = (
    "python",
    "javascript",
    "java",
    "c",
    "cpp",
    "sql",
    "html",
    "css",
)

REFACTOR_GOALS = (
    "readability",
    "duplication",
    "simplify_conditions",
    "naming",
    "extract_functions",
    "performance",
)


def _limit_text(value: str, max_chars: int, field_name: str) -> str:
    text = value.strip()
    if not text:
        raise ValueError(f"{field_name} cannot be empty")
    if len(text) > max_chars:
        raise ValueError(f"{field_name} exceeds {max_chars} characters")
    return text


def _validate_language(value: str) -> str:
    language = value.lower().strip()
    if language not in SUPPORTED_LANGUAGES:
        raise ValueError(f"Unsupported language: {value}")
    return language


class ChatRequest(BaseModel):
    message: str
    conversation_id: int | None = None
    code: str | None = None
    language: str | None = None

    @field_validator("message")
    @classmethod
    def validate_message(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_prompt_chars, "message")

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        return _limit_text(value, get_settings().max_code_chars, "code")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        return _validate_language(value)


class GenerateRequest(BaseModel):
    requirements: str
    language: str = "python"

    @field_validator("requirements")
    @classmethod
    def validate_requirements(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_prompt_chars, "requirements")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return _validate_language(value)


class DebugRequest(BaseModel):
    code: str
    language: str = "python"
    error_message: str | None = None

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_code_chars, "code")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return _validate_language(value)

    @field_validator("error_message")
    @classmethod
    def validate_error(cls, value: str | None) -> str | None:
        if value is None or not value.strip():
            return None
        return _limit_text(value, get_settings().max_prompt_chars, "error_message")


class ExplainRequest(BaseModel):
    code: str
    language: str = "python"

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_code_chars, "code")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return _validate_language(value)


class RefactorRequest(BaseModel):
    code: str
    language: str = "python"
    goals: list[str] = Field(default_factory=lambda: ["readability"])

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_code_chars, "code")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return _validate_language(value)

    @field_validator("goals")
    @classmethod
    def validate_goals(cls, value: list[str]) -> list[str]:
        cleaned = []
        for item in value:
            goal = item.strip().lower()
            if goal not in REFACTOR_GOALS:
                raise ValueError(f"Unsupported refactor goal: {item}")
            if goal not in cleaned:
                cleaned.append(goal)
        return cleaned or ["readability"]


class TestsRequest(BaseModel):
    code: str
    language: str = "python"

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_code_chars, "code")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return _validate_language(value)


class ReviewRequest(BaseModel):
    code: str
    language: str = "python"

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str) -> str:
        return _limit_text(value, get_settings().max_code_chars, "code")

    @field_validator("language")
    @classmethod
    def validate_language(cls, value: str) -> str:
        return _validate_language(value)


class HealthResponse(BaseModel):
    status: Literal["ok"]
    llm_configured: bool
    model: str | None = None
