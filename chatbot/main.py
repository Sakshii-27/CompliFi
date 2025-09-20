from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
import base64

from document_manager import (
    compute_pdf_hash,
    get_or_create_vectorstore,
    read_meta,
)
from chatbot_core import answer_query

app = FastAPI()

# CORS for Next.js (3000) and Vite (5173/5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class UploadDocRequest(BaseModel):
    # Stage 1 JSON payload with sections a,b,c
    stage1: Dict[str, Any]
    # Optional PDF bytes (base64) – if not provided, we hash the JSON
    pdf_bytes_b64: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    # Optional hash to select a specific document context
    doc_hash: Optional[str] = None


# In-memory cache of vectorstores by hash and the latest active hash
VECTORSTORES: Dict[str, any] = {}
CURRENT_HASH: Optional[str] = None


@app.get("/")
async def root():
    return {"message": "Vigilo API is running! (RAG: Stage 1 JSON)"}


@app.post("/upload-document")
async def upload_document(payload: UploadDocRequest):
    global CURRENT_HASH

    file_bytes = None
    if payload.pdf_bytes_b64:
        try:
            file_bytes = base64.b64decode(payload.pdf_bytes_b64)
        except Exception:
            file_bytes = None

    doc_hash = compute_pdf_hash(file_bytes, payload.stage1)

    # Build or reuse up-to-date vectorstore
    vs = get_or_create_vectorstore(doc_hash, payload.stage1)
    VECTORSTORES[doc_hash] = vs
    CURRENT_HASH = doc_hash

    return {
        "status": "ok",
        "hash": doc_hash,
        "message": "Vectorstore ready for Stage 1. Subsequent /chat will use this context.",
    }


@app.get("/debug-hash")
async def debug_hash(hash: str = None):
    if not hash:
        return {"error": "Provide ?hash=<your_hash>"}
    meta = read_meta(hash)
    loaded = hash in VECTORSTORES
    return {
        "hash": hash,
        "meta": meta,
        "loaded_in_memory": loaded,
        "current_hash": CURRENT_HASH
    }


@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    try:
        active_hash = request.doc_hash or CURRENT_HASH
        
        # HARD REQUIREMENT: Must have valid hash
        if not active_hash:
            return {
                "reply": " No Stage 1 context loaded. Please run 'Test Compliance' on the dashboard first, then try again."
            }
        
        # HARD REQUIREMENT: Hash must exist in vectorstores
        if active_hash not in VECTORSTORES:
            return {
                "reply": f" Stage 1 context '{active_hash[:8]}...' not found. Please run 'Test Compliance' to reload, then try again."
            }
        
        vs = VECTORSTORES[active_hash]
        response = answer_query(vs, request.message)
        return {"reply": response}
    except Exception as e:
        return {"error": f"Chat failed: {str(e)}"}
