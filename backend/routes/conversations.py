from fastapi import APIRouter, HTTPException

from database import delete_conversation, get_conversation, list_conversations

router = APIRouter()


@router.get("/conversations")
def conversations() -> dict:
    return {"conversations": list_conversations()}


@router.get("/conversations/{conversation_id}")
def conversation_detail(conversation_id: int) -> dict:
    item = get_conversation(conversation_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return item


@router.delete("/conversations/{conversation_id}")
def conversation_delete(conversation_id: int) -> dict:
    if not delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"ok": True, "id": conversation_id}
