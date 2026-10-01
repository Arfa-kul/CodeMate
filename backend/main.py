"""CodeMate API entrypoint."""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import get_settings
from database import init_db
from routes import chat, code_tools, conversations

settings = get_settings()
limiter = Limiter(key_func=get_remote_address, default_limits=[settings.rate_limit])


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Path(settings.database_path).parent.mkdir(parents=True, exist_ok=True)
    init_db()
    yield


app = FastAPI(
    title="CodeMate AI",
    description="Educational AI coding assistant. Generated code is not guaranteed to be correct.",
    version="1.0.0",
    lifespan=lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(SlowAPIMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request: Request, exc: StarletteHTTPException):
    detail = exc.detail
    if not isinstance(detail, str):
        detail = str(detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": detail})


app.include_router(chat.router, prefix="/api")
app.include_router(code_tools.router, prefix="/api")
app.include_router(conversations.router, prefix="/api")


@app.get("/")
def root() -> dict:
    return {
        "name": "CodeMate AI",
        "docs": "/docs",
        "health": "/api/health",
    }
