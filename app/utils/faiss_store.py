import json
import logging
from pathlib import Path

# pyrefly: ignore [missing-import]
import faiss 
# pyrefly: ignore [missing-import]
import numpy as np

from app.utils.embeddings import embed_chunks

logger = logging.getLogger(__name__)

VECTORSTORE_DIR = Path(__file__).resolve().parent.parent.parent / "vectorstore"

def store_embeddings_in_faiss(
    chunks: list[str],
    embeddings: list[list[float]],
    index_name: str = "default",
) -> Path:
    if len(chunks) != len(embeddings):
        raise ValueError("chunks and embeddings must have the same length.")
    if not chunks:
        raise ValueError("Cannot build a FAISS index from empty data.")

    vectors = np.asarray(embeddings, dtype=np.float32)
    if vectors.ndim != 2 or vectors.shape[0] == 0 or vectors.shape[1] == 0:
        raise ValueError("embeddings must be a non-empty 2D array-like [n, d].")

    vectors = np.ascontiguousarray(vectors, dtype=np.float32)
    dimension = vectors.shape[1]

    # Use cosine similarity (normalize + IP)
    faiss.normalize_L2(vectors)
    index = faiss.IndexFlatIP(dimension)

    VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)
    index.add(vectors)


    index_path = VECTORSTORE_DIR / f"{index_name}.index"
    chunks_path = VECTORSTORE_DIR / f"{index_name}_chunks.json"
    

    faiss.write_index(index, str(index_path))
    chunks_path.write_text(json.dumps(chunks, ensure_ascii=False), encoding="utf-8")

    return index_path

def load_faiss_index(index_name: str = "default") -> tuple[faiss.Index, list[str]]:
    index_path = VECTORSTORE_DIR / f"{index_name}.index"
    chunks_path = VECTORSTORE_DIR / f"{index_name}_chunks.json"

    logger.info("[load_faiss_index] index_path=%s  exists=%s", index_path, index_path.exists())
    logger.info("[load_faiss_index] chunks_path=%s  exists=%s", chunks_path, chunks_path.exists())

    if not index_path.exists() or not chunks_path.exists():
        raise FileNotFoundError(f"FAISS index '{index_name}' not found in {VECTORSTORE_DIR}")

    index = faiss.read_index(str(index_path))
    chunks = json.loads(chunks_path.read_text(encoding="utf-8"))

    logger.info("[load_faiss_index] vectors=%d  chunks=%d  dim=%d", index.ntotal, len(chunks), index.d)

    if index.ntotal != len(chunks):
        raise ValueError(
            f"Corrupt index '{index_name}': index has {index.ntotal} vectors but "
            f"{len(chunks)} chunks were saved. Re-ingest/rebuild the index."
        )

    return index, chunks


def search_faiss_index(
    query_embedding: list[float],
    index: faiss.Index,
    chunks: list[str],
    top_k: int = 3,
) -> list[dict[str, float | str]]:
    if index.ntotal == 0:
        return []

    if len(query_embedding) != index.d:
        raise ValueError(
            f"Query embedding dimension {len(query_embedding)} does not match "
            f"FAISS index dimension {index.d}. Rebuild the index using the same "
            "embedding model/dimension used for questions."
        )

    query = np.array([query_embedding], dtype=np.float32)
    faiss.normalize_L2(query)

    k = min(top_k, index.ntotal)
    scores, indices = index.search(query, k)

    logger.info("[search_faiss_index] FAISS scores=%s  indices=%s", scores[0].tolist(), indices[0].tolist())

    results: list[dict[str, float | str]] = []
    for score, idx in zip(scores[0], indices[0]):
        idx = int(idx)
        if idx == -1:
            continue
        results.append({"chunk": chunks[idx], "score": float(score)})

    logger.info("[search_faiss_index] returning %d results", len(results))
    return results

def search_similar_chunks(
    question: str,
    index_name: str = "default",
    top_k: int = 3,
) -> list[dict[str, float | str]]:
    if not question or not question.strip():
        logger.warning("[search_similar_chunks] empty question, returning []")
        return []

    logger.info("[search_similar_chunks] question=%r  index_name=%r  top_k=%d", question, index_name, top_k)

    try:
        index, chunks = load_faiss_index(index_name)
        query_embedding = embed_chunks([question.strip()])[0]
        logger.info("[search_similar_chunks] query embedding dim=%d", len(query_embedding))
        results = search_faiss_index(query_embedding, index, chunks, top_k=top_k)
        logger.info("[search_similar_chunks] returning %d results", len(results))
        return results
    except Exception:
        logger.exception("[search_similar_chunks] retrieval failed for index_name=%r", index_name)
        return []


def search_similar_chunks_with_error(
    question: str,
    index_name: str = "default",
    top_k: int = 3,
) -> tuple[list[dict[str, float | str]], str | None]:
    """
    Same as search_similar_chunks(), but also returns an error string when retrieval fails.
    This is useful for debugging (missing index, dimension mismatch, corrupt index).
    """
    if not question or not question.strip():
        return [], "Question cannot be empty."

    try:
        index, chunks = load_faiss_index(index_name)
        query_embedding = embed_chunks([question.strip()])[0]
        return search_faiss_index(query_embedding, index, chunks, top_k=top_k), None
    except FileNotFoundError:
        return [], f"Index '{index_name}' not found. Expected files in: {VECTORSTORE_DIR}"
    except ValueError as exc:
        return [], str(exc)
