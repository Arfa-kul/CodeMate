# CodeMate AI — Intelligent Coding Assistant

Final-year Computer Science project: an original AI coding assistant inspired by tools such as Continue, implemented as a small, explainable web application.

CodeMate does **not** copy the Continue repository. It is a standalone React + FastAPI app that talks to any OpenAI-compatible language model and still offers local static analysis when no API key is present.

Generated code is **not guaranteed to be correct**. Heuristic reviews are **not a complete security audit**. Submitted code is **never executed**.

## Problem statement

Students and junior developers need help explaining code, spotting bugs, and writing tests, but commercial assistants are hard to inspect for a viva. The goal is a working system whose architecture, prompts, and database you can defend in an interview.

## Proposed solution

A browser dashboard sends structured requests to a FastAPI backend. The backend:

1. Validates input size and language.
2. Runs Python AST / heuristic analysis where useful.
3. Calls a shared LLM client (OpenAI-compatible `/chat/completions`).
4. Stores chat history in SQLite (messages only — never API keys).

```
Browser (React + Vite)
        |
        |  JSON over HTTP (/api/*)
        v
FastAPI routers  -->  AIService  -->  OpenAI-compatible API
        |                 |
        |                 +--> code_analysis (AST / heuristics)
        v
     SQLite (conversations, messages)
```

## Features

| Area | What it does |
| --- | --- |
| Chat | Questions, conversions, error explanations, optional attached snippet |
| Generate | Language selector, requirements, copy / clear / regenerate |
| Debugger | Syntax vs possible logic bugs, optional runtime message |
| Explainer | Purpose, steps, names, I/O, complexity, limitations |
| Refactor | Goals such as naming, duplication, extract functions |
| Unit tests | Suggested tests; code is not executed |
| Review | Severity, explanation, snippet, suggestion + disclaimer |
| History | Create, list, open, delete conversations |

## Technology stack

- **React + Vite + JavaScript** — fast student-friendly UI without a heavy framework.
- **Tailwind CSS** — consistent dark developer-tool layout.
- **FastAPI** — typed request models and automatic `/docs`.
- **SQLite** — zero-ops persistence for conversations.
- **Python `ast`** — confirmed Python syntax errors without running code.
- **OpenAI-compatible HTTP API** — swap providers by changing `LLM_BASE_URL` and `LLM_MODEL`.

## Folder structure

```
CodeMate/
  backend/
    main.py              # FastAPI app, CORS, rate limit, startup
    config.py            # Environment settings
    database.py          # SQLite helpers
    models.py            # Pydantic request models
    routes/              # /chat, /generate, /debug, ...
    services/ai_service.py
    services/code_analysis.py
    prompts/chat_prompts.py
  frontend/              # Vite React app
  tests/                 # pytest (AI provider mocked)
  .env.example
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- An OpenAI-compatible API key **only if** you want LLM replies (optional for local analysis and tests)

## Installation

From the project root:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r backend\requirements.txt

cd frontend
npm install
cd ..
```

On macOS/Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
cd frontend && npm install && cd ..
```

## Environment configuration

```powershell
copy .env.example .env
```

Then edit `.env`:

| Variable | Purpose |
| --- | --- |
| `LLM_API_KEY` | Secret for the model provider. Leave empty to use local analysis only. |
| `LLM_BASE_URL` | Provider base URL, e.g. `https://api.openai.com/v1` |
| `LLM_MODEL` | Model id, e.g. `gpt-4o-mini` |
| `LLM_TIMEOUT_SECONDS` | HTTP timeout (default 60) |
| `DATABASE_PATH` | SQLite file path |
| `CORS_ORIGINS` | Allowed frontend origins |

`.env` is git-ignored. Keys never go in frontend code.

## How to configure an AI provider

1. Create a key with OpenAI, Groq, Together, Fireworks, Azure OpenAI (compatible mode), or a local server such as Ollama with an OpenAI shim.
2. Put the key in `LLM_API_KEY`.
3. Set `LLM_BASE_URL` so that `POST {LLM_BASE_URL}/chat/completions` is valid.
4. Set `LLM_MODEL` to a model that provider supports.
5. Restart the backend.

If the key is missing, the UI shows a setup banner. Debugger, explainer, and review still return AST/heuristic results. The unit-test page can still draft **pytest stubs** from Python function names without executing the code.

## Quick Run (1-Click)

On Windows, simply double-click **`run.bat`** (or run `.\run.ps1` in PowerShell). This launches both the FastAPI backend and Vite frontend automatically!

## Manual Run (Two Terminals)

### 1. Run the backend

```powershell
.\.venv\Scripts\Activate.ps1
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8002
```

Open http://127.0.0.1:8002/docs for the interactive API.

### 2. Run the frontend

In a second terminal:

```powershell
cd frontend
npm run dev
```

Open http://localhost:5174. Vite proxies `/api` to the backend.

## Testing

From the project root with the venv active:

```powershell
python -m pytest -q
```

Tests mock the LLM and use a temporary SQLite file. They do **not** need a paid API key.

Covered:

- Request validation (empty chat, unsupported language)
- Conversation CRUD
- Python AST syntax and `eval` detection
- AI timeout / missing-key errors
- Health, chat, debug, review, generate (mocked), refactor, tests endpoint without a key
- Fenced-code extraction for the generated-code panel

## Limitations

- No IDE extension or repo-wide index (unlike Continue).
- Tests are suggested, not executed.
- Heuristic security checks are incomplete by design.
- Rate limiting is in-memory (per process).
- Multi-user auth is not implemented.

## Future enhancements

- User accounts and shared workspaces
- Streaming token responses
- Language Server integration
- Optional sandboxed test runner with a strict allow-list
- Vector search over a local project (explicit opt-in)

## License

Academic / coursework use. Not affiliated with Continue.dev.
