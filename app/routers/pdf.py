from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.pipeline.rag_pipeline import ingest_pdf

router = APIRouter(prefix="/pdf", tags=["pdf"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # -----------------------------
    # Validate file type
    # -----------------------------
    if file.content_type not in ("application/pdf", "application/x-pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="File must have a .pdf extension."
        )

    # -----------------------------
    # Read and save uploaded file
    # -----------------------------
    try:
        contents = await file.read()

        if len(contents) == 0:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file is empty."
            )

        if len(contents) > MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=400,
                detail="File exceeds the 10 MB size limit."
            )

        # -----------------------------
        # Create uploads folder
        # -----------------------------
        UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

        # -----------------------------
        # Save uploaded PDF
        # -----------------------------
        safe_name = Path(file.filename).name
        saved_path = UPLOAD_DIR / safe_name

        saved_path.write_bytes(contents)
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Unable to upload PDF."
        )

    # -----------------------------
    # Create unique FAISS index
    # -----------------------------
    index_name = "medical_inventory"

    # -----------------------------
    # Run RAG ingestion pipeline
    # -----------------------------
    try:
        ingest_result = ingest_pdf(
            pdf_path=saved_path,
            index_name=index_name,
            source_filename=safe_name,
        )
    except Exception as e:
        print(e)
        raise HTTPException(
            status_code=500,
            detail="Unable to ingest PDF."
        )
    # -----------------------------
    # Success response
    # -----------------------------
    return {
    "message": "PDF uploaded and indexed successfully",
    "filename": safe_name,
    "saved_as": safe_name,
    "index_name": index_name,
    "size_bytes": len(contents),
    "path": str(saved_path),
    **ingest_result,
}