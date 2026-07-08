from pathlib import Path

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.pipeline.rag_pipeline import ingest_pdf, query

router = APIRouter(prefix="/rag", tags=["rag"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"


class IngestRequest(BaseModel):
    pdf_path: str = Field(..., description="Path returned from POST /pdf/upload")
    index_name: str = "medical_inventory"

class AskRequest(BaseModel):
    question: str = Field(..., example="What is the standard dosage of insulin?")
    index_name: str = Field(default="medical_inventory", example="medical_inventory")
    top_k: int = Field(default=3, ge=1, le=10, example=3)

@router.post("/ingest")
async def ingest_document(request: IngestRequest):
    pdf_path = Path(request.pdf_path)

    if not pdf_path.exists():
        uploads_candidate = UPLOAD_DIR / pdf_path.name
        if uploads_candidate.exists():
            pdf_path = uploads_candidate
        else:
            raise HTTPException(status_code=404, detail=f"PDF not found: {request.pdf_path}")

    try:
        result = ingest_pdf(pdf_path, index_name=request.index_name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return {
        "message": "PDF ingested into knowledge base",
        **result,
    }


@router.post("/ask")
async def ask_question(request: AskRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    try:
        result = query(
            question=request.question,
            index_name=request.index_name,
            top_k=request.top_k,
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Index '{request.index_name}' not found. Ingest a PDF first.",
        ) from exc
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return result
