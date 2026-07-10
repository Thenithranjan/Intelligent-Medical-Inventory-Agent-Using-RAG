from pathlib import Path

from app.utils.embeddings import embed_chunks
from app.utils.faiss_store import store_embeddings_in_faiss
from app.utils.groq_rag import answer_with_rag
from app.utils.pdf_reader import read_pdf_pages
from app.utils.text_chunker import chunk_text_with_metadata


def ingest_pdf(
    pdf_path: str | Path,
    index_name: str = "default",
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
    source_filename: str | None = None,
) -> dict[str, str | int]:
    """Ingestion pipeline: PDF → pages → chunks w/ metadata → embeddings → FAISS (append)."""
    pdf_path = Path(pdf_path)
    source = source_filename or pdf_path.name

    pages = read_pdf_pages(pdf_path)
    if not pages:
        raise ValueError("No text could be extracted from the PDF.")

    chunk_metas = chunk_text_with_metadata(
        pages, source=source, chunk_size=chunk_size, chunk_overlap=chunk_overlap
    )

    if not chunk_metas:
        raise ValueError("No text could be extracted from the PDF.")

    # Embed only the chunk text
    chunk_texts = [m["chunk"] for m in chunk_metas]
    embeddings = embed_chunks(chunk_texts)

    index_path = store_embeddings_in_faiss(
        chunk_metas, embeddings,
        index_name=index_name,
        source_filename=source,
    )

    return {
        "index_name": index_name,
        "index_path": str(index_path),
        "chunk_count": len(chunk_metas),
        "source": source,
    }


def query(
    question: str,
    index_name: str = "default",
    top_k: int = 5,
) -> dict[str, str | list[dict]]:
    """Query pipeline: question → FAISS retrieval → Groq answer."""
    return answer_with_rag(question, index_name=index_name, top_k=top_k)
