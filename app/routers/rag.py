from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.pipeline.rag_pipeline import ingest_pdf
from app.utils.faiss_store import VECTORSTORE_DIR, search_similar_chunks
from app.utils.groq_rag import ask_groq

router = APIRouter(prefix="/rag", tags=["rag"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


class IngestRequest(BaseModel):
    pdf_path: str = Field(..., description="Path returned from POST /pdf/upload")
    index_name: str = "medical_inventory"

class AskRequest(BaseModel):
    question: str = Field(..., example="What is the standard dosage of insulin?")
    index_name: str = Field(default="medical_inventory", example="medical_inventory")
    top_k: int = Field(default=5, ge=1, le=10, example=5)

@router.post("/ingest")
async def ingest_document(request: IngestRequest):
    pdf_path = Path(request.pdf_path)

    if not pdf_path.exists():
        uploads_candidate = UPLOAD_DIR / pdf_path.name
        if uploads_candidate.exists():
            pdf_path = uploads_candidate
        else:
            raise HTTPException(status_code=404, detail="Unable to ingest PDF.")

    try:
        result = ingest_pdf(pdf_path, index_name=request.index_name, source_filename=pdf_path.name)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unable to ingest PDF.")

    return {
        "message": "PDF ingested into knowledge base",
        **result,
    }


@router.post("/ask")
async def ask_question(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    # Check if the FAISS index exists
    index_path = VECTORSTORE_DIR / f"{request.index_name}.index"
    chunks_path = VECTORSTORE_DIR / f"{request.index_name}_chunks.json"
    if not index_path.exists() or not chunks_path.exists():
        raise HTTPException(
            status_code=404,
            detail="No relevant information found in uploaded documents."
        )

    # Perform retrieval search
    try:
        retrieved = search_similar_chunks(
            request.question,
            index_name=request.index_name,
            top_k=request.top_k
        )
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail="No relevant information found in uploaded documents."
        )

    if not retrieved:
        raise HTTPException(
            status_code=404,
            detail="No relevant information found in uploaded documents."
        )

    # Generate response via Groq
    try:
        answer = ask_groq(request.question, retrieved)
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Unable to generate response from Groq."
        )

    # Build sources summary
    seen = set()
    sources_summary = []
    for item in retrieved:
        source = item.get("source", "unknown")
        page = item.get("page", "?")
        key = f"{source}|{page}"
        if key not in seen:
            seen.add(key)
            sources_summary.append(f"{source} (Page {page})")

    return {
        "answer": answer,
        "sources": retrieved,
        "sources_summary": sources_summary,
    }
