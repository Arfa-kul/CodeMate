from database import add_message, create_conversation, delete_conversation, get_conversation, list_conversations


def test_conversation_crud_roundtrip(client):
    created = create_conversation("First chat")
    assert created["title"] == "First chat"
    add_message(created["id"], "user", "Hello")
    add_message(created["id"], "assistant", "Hi there")

    listed = list_conversations()
    assert any(item["id"] == created["id"] for item in listed)

    detail = get_conversation(created["id"])
    assert detail is not None
    assert len(detail["messages"]) == 2
    assert detail["messages"][0]["role"] == "user"

    assert delete_conversation(created["id"]) is True
    assert get_conversation(created["id"]) is None


def test_add_message_unknown_conversation(client):
    try:
        add_message(99999, "user", "nope")
        assert False, "expected ValueError"
    except ValueError as exc:
        assert "not found" in str(exc)
