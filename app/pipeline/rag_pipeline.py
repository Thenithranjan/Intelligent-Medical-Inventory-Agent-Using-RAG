from pathlib import Path

from app.utils.embeddings import embed_chunks
from app.utils.faiss_store import store_embeddings_in_faiss
from app.utils.groq_rag import answer_with_rag
from app.utils.pdf_reader import read_pdf_text
from app.utils.text_chunker import chunk_text


def ingest_pdf(
    pdf_path: str | Path,
    index_name: str = "default",
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> dict[str, str | int]:
    """Ingestion pipeline: PDF → text → chunks → embeddings → FAISS."""
    text = read_pdf_text(pdf_path)
    chunks = chunk_text(text, chunk_size=chunk_size, chunk_overlap=chunk_overlap)

    if not chunks:
        raise ValueError("No text could be extracted from the PDF.")

    embeddings = embed_chunks(chunks)
    index_path = store_embeddings_in_faiss(chunks, embeddings, index_name=index_name)

    return {
        "index_name": index_name,
        "index_path": str(index_path),
        "chunk_count": len(chunks),
        "text_length": len(text),
    }


def query(
    question: str,
    index_name: str = "default",
    top_k: int = 3,
) -> dict[str, str | list[dict[str, float | str]]]:
    """Query pipeline: question → FAISS retrieval → Groq answer."""
    return answer_with_rag(question, index_name=index_name, top_k=top_k)
