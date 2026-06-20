import json
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.property_intelligence import PropertySearchRequest, build_property_report
from middleware import handle_nexus_query

ROOT = Path(__file__).resolve().parent.parent
PROMPT_PATH = ROOT / "nexus_prompt.txt"
CONFIG_PATH = ROOT / "config.json"

app = FastAPI(title="Nexus Context AI", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://jameswei.me",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class QueryResponse(BaseModel):
    status: str
    message: str


def load_config() -> dict:
    with open(CONFIG_PATH, encoding="utf-8") as f:
        return json.load(f)


def load_system_prompt() -> str:
    return PROMPT_PATH.read_text(encoding="utf-8")


def call_gemini(user_input: str) -> str:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY not configured on server.",
        )

    import google.generativeai as genai

    config = load_config()
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(
        model_name=config.get("modelName", "gemini-1.5-pro"),
        system_instruction=load_system_prompt(),
        generation_config=config.get("generationConfig"),
    )

    response = model.generate_content(user_input)
    return response.text or "No response generated."


@app.get("/health")
def health():
    return {"status": "ok", "service": "nexus-context-ai"}


@app.post("/api/nexus/query", response_model=QueryResponse)
def nexus_query(body: QueryRequest):
    raw = handle_nexus_query(body.message.strip(), lambda q: call_gemini(q))

    try:
        parsed = json.loads(raw)
        if parsed.get("status") == "error":
            return QueryResponse(status="error", message=parsed["message"])
    except json.JSONDecodeError:
        pass

    return QueryResponse(status="ok", message=raw)


@app.post("/api/property/intelligence")
def property_intelligence(body: PropertySearchRequest):
    return build_property_report(body)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", "8000")))
