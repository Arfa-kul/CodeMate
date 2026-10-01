from fastapi import APIRouter, HTTPException

from config import get_settings
from database import add_message, create_conversation, get_conversation
from models import ChatRequest, HealthResponse
from prompts.chat_prompts import CHAT_SYSTEM
from services.ai_service import AINotConfiguredError, AIServiceError, ai_service, setup_payload

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        llm_configured=settings.llm_configured,
        model=settings.llm_model if settings.llm_configured else None,
    )


@router.post("/chat")
def chat(payload: ChatRequest) -> dict:
    conversation = None
    if payload.conversation_id is not None:
        conversation = get_conversation(payload.conversation_id)
        if conversation is None:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = create_conversation()

    user_text = payload.message
    if payload.code:
        language = payload.language or "text"
        user_text = (
            f"{payload.message}\n\nAttached {language} code:\n```{language}\n{payload.code}\n```"
        )

    add_message(conversation["id"], "user", user_text)

    history = []
    stored = get_conversation(conversation["id"])
    if stored:
        for message in stored["messages"][:-1]:
            history.append({"role": message["role"], "content": message["content"]})

    try:
        reply = ai_service.chat(CHAT_SYSTEM, user_text, history=history)
        add_message(conversation["id"], "assistant", reply)
        return {
            "conversation_id": conversation["id"],
            "reply": reply,
            "ai_used": True,
            **setup_payload(),
        }
    except AINotConfiguredError as exc:
        fallback = (
            "CodeMate cannot call a language model until you set LLM_API_KEY. "
            "Use Code Explainer, Debugger, or Code Review for local static analysis, "
            "or add an OpenAI-compatible key in Settings."
        )
        add_message(conversation["id"], "assistant", fallback)
        return {
            "conversation_id": conversation["id"],
            "reply": fallback,
            "ai_used": False,
            **setup_payload(),
            "error": exc.message,
        }
    except AIServiceError as exc:
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
