from fastapi import APIRouter, HTTPException

from models import DebugRequest, ExplainRequest, GenerateRequest, RefactorRequest, ReviewRequest, TestsRequest
from prompts.chat_prompts import (
    DEBUG_SYSTEM,
    EXPLAIN_SYSTEM,
    GENERATE_SYSTEM,
    REFACTOR_SYSTEM,
    REVIEW_SYSTEM,
    TESTS_SYSTEM,
    with_static_analysis,
)
from services.ai_service import AINotConfiguredError, AIServiceError, ai_service, setup_payload
from services.code_analysis import (
    analyze_code,
    extract_fenced_code,
    fallback_debug,
    fallback_review,
    fallback_unit_tests,
)

router = APIRouter()


def _run(system: str, user: str) -> str:
    try:
        return ai_service.chat(system, user)
    except AINotConfiguredError:
        raise
    except AIServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc


@router.post("/generate")
def generate_code(payload: GenerateRequest) -> dict:
    user = (
        f"Write {payload.language} code for the following requirements:\n"
        f"{payload.requirements}\n\n"
        "Return the code in a fenced block, then a short explanation. "
        "Remind the reader to review the code before running it."
    )
    try:
        reply = _run(GENERATE_SYSTEM, user)
        return {
            "reply": reply,
            "code": extract_fenced_code(reply),
            "language": payload.language,
            "ai_used": True,
            **setup_payload(),
        }
    except AINotConfiguredError as exc:
        return {
            "reply": None,
            "code": None,
            "language": payload.language,
            "ai_used": False,
            **setup_payload(),
            "error": exc.message,
        }


@router.post("/debug")
def debug_code(payload: DebugRequest) -> dict:
    analysis = analyze_code(payload.code, payload.language)
    error_part = payload.error_message or "(none provided)"
    user = with_static_analysis(
        (
            f"Language: {payload.language}\n"
            f"Error message: {error_part}\n\n"
            f"Code:\n```{payload.language}\n{payload.code}\n```\n\n"
            "Explain likely cause, relevant lines, suggested correction, corrected code, and why it works. "
            "Label confirmed syntax errors vs possible logical bugs."
        ),
        analysis["summary"],
    )
    try:
        reply = _run(DEBUG_SYSTEM, user)
        return {
            "reply": reply,
            "analysis": analysis,
            "corrected_code": extract_fenced_code(reply),
            "ai_used": True,
            **setup_payload(),
        }
    except AINotConfiguredError:
        result = fallback_debug(payload.code, payload.language, payload.error_message)
        result.update(setup_payload())
        return result


@router.post("/explain")
def explain_code(payload: ExplainRequest) -> dict:
    analysis = analyze_code(payload.code, payload.language)
    user = with_static_analysis(
        f"Explain this {payload.language} code:\n```{payload.language}\n{payload.code}\n```",
        analysis["summary"],
    )
    try:
        reply = _run(EXPLAIN_SYSTEM, user)
        return {"reply": reply, "analysis": analysis, "ai_used": True, **setup_payload()}
    except AINotConfiguredError as exc:
        syntax = analysis["syntax"]
        local = ["## Local explanation (no AI key configured)"]
        if payload.language == "python" and not syntax.get("ok"):
            local.append(
                f"This snippet does not parse as Python: {syntax.get('error')} on line {syntax.get('lineno')}."
            )
        elif payload.language == "python":
            local.append(
                "The snippet is valid Python according to the AST parser. "
                "Without an LLM, CodeMate cannot infer intent; inspect function names and comments yourself."
            )
        else:
            local.append(
                f"Static heuristics ran for {payload.language}. Configure LLM_API_KEY for a full explanation."
            )
        local.append("### Heuristic notes")
        local.append(analysis["summary"])
        return {
            "reply": "\n\n".join(local),
            "analysis": analysis,
            "ai_used": False,
            **setup_payload(),
            "error": exc.message,
        }


@router.post("/refactor")
def refactor_code(payload: RefactorRequest) -> dict:
    goals = ", ".join(payload.goals)
    user = (
        f"Refactor this {payload.language} code.\n"
        f"Goals: {goals}\n\n"
        f"Original:\n```{payload.language}\n{payload.code}\n```\n\n"
        "Show original and proposed code in separate fenced blocks. List the changes."
    )
    try:
        reply = _run(REFACTOR_SYSTEM, user)
        proposed = extract_fenced_code(reply, last=True)
        return {
            "reply": reply,
            "original_code": payload.code,
            "proposed_code": proposed,
            "language": payload.language,
            "goals": payload.goals,
            "ai_used": True,
            **setup_payload(),
        }
    except AINotConfiguredError as exc:
        return {
            "reply": (
                "Refactoring suggestions need a language model. "
                "Set LLM_API_KEY to generate a rewritten version. Original code is returned unchanged."
            ),
            "original_code": payload.code,
            "proposed_code": payload.code,
            "language": payload.language,
            "goals": payload.goals,
            "ai_used": False,
            **setup_payload(),
            "error": exc.message,
        }


@router.post("/tests")
def generate_tests(payload: TestsRequest) -> dict:
    user = (
        f"Generate unit tests for this {payload.language} code. "
        "Do not execute it.\n\n"
        f"```{payload.language}\n{payload.code}\n```"
    )
    try:
        reply = _run(TESTS_SYSTEM, user)
        return {
            "reply": reply,
            "code": extract_fenced_code(reply),
            "language": payload.language,
            "ai_used": True,
            **setup_payload(),
        }
    except AINotConfiguredError:
        result = fallback_unit_tests(payload.code, payload.language)
        result.update(setup_payload())
        result["language"] = payload.language
        return result


@router.post("/review")
def review_code(payload: ReviewRequest) -> dict:
    analysis = analyze_code(payload.code, payload.language)
    user = with_static_analysis(
        (
            f"Review this {payload.language} code. "
            "Findings must include severity, explanation, affected code, and a suggested improvement. "
            "State that heuristic review is not a complete security audit.\n\n"
            f"```{payload.language}\n{payload.code}\n```"
        ),
        analysis["summary"],
    )
    try:
        reply = _run(REVIEW_SYSTEM, user)
        return {"reply": reply, "analysis": analysis, "ai_used": True, **setup_payload()}
    except AINotConfiguredError:
        result = fallback_review(payload.code, payload.language)
        result.update(setup_payload())
        return result
