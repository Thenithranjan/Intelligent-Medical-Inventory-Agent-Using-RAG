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


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------

def _load_existing_chunks(chunks_path: Path) -> list[dict]:
    """Load the chunks JSON.  Handles both old (list[str]) and new (list[dict]) formats."""
    if not chunks_path.exists():
        return []
    raw = json.loads(chunks_path.read_text(encoding="utf-8"))
    if not raw:
        return []
    # Migrate old plain-string format → dict format
    if isinstance(raw[0], str):
        return [{"chunk": c, "source": "unknown", "page": 0} for c in raw]
    return raw


def _remove_source_from_chunks(chunks: list[dict], source: str) -> list[dict]:
    """Return chunks that do NOT belong to *source*."""
    return [c for c in chunks if c.get("source") != source]


# ---------------------------------------------------------------------------
# Store / append embeddings
# ---------------------------------------------------------------------------

def store_embeddings_in_faiss(
    chunk_metas: list[dict],
    embeddings: list[list[float]],
    index_name: str = "default",
    source_filename: str | None = None,
) -> Path:
    """Create or **append to** a FAISS index.

    Parameters
    ----------
    chunk_metas : list[dict]
        ``[{"chunk": "...", "source": "file.pdf", "page": 3}, ...]``
    embeddings : list[list[float]]
        Corresponding embedding vectors.
    index_name : str
        Logical name of the index (e.g. ``"medical_inventory"``).
    source_filename : str | None
        If provided and the source already exists in the index,
        its old vectors are removed first (prevents duplicates on re-upload).
    """
    if len(chunk_metas) != len(embeddings):
        raise ValueError("chunk_metas and embeddings must have the same length.")
    if not chunk_metas:
        raise ValueError("Cannot build a FAISS index from empty data.")

    VECTORSTORE_DIR.mkdir(parents=True, exist_ok=True)

    index_path = VECTORSTORE_DIR / f"{index_name}.index"
    chunks_path = VECTORSTORE_DIR / f"{index_name}_chunks.json"

    # ---- Load existing data (if any) ----
    existing_chunks = _load_existing_chunks(chunks_path)

    # ---- Handle re-upload of the same PDF ----
    if source_filename and existing_chunks:
        existing_chunks = _remove_source_from_chunks(existing_chunks, source_filename)

    # ---- Merge: existing + new ----
    all_chunks = existing_chunks + chunk_metas

    # ---- Re-embed kept chunks if we had to remove some (re-upload case) ----
    if existing_chunks:
        kept_texts = [c["chunk"] for c in existing_chunks]
        kept_embeddings = embed_chunks(kept_texts)
        all_embeddings = kept_embeddings + embeddings
    else:
        all_embeddings = embeddings

    # ---- Build FAISS index from scratch with all vectors ----
    vectors = np.asarray(all_embeddings, dtype=np.float32)
    if vectors.ndim != 2 or vectors.shape[0] == 0 or vectors.shape[1] == 0:
        raise ValueError("embeddings must be a non-empty 2D array-like [n, d].")

    vectors = np.ascontiguousarray(vectors, dtype=np.float32)
    dimension = vectors.shape[1]

    faiss.normalize_L2(vectors)
    index = faiss.IndexFlatIP(dimension)
    index.add(vectors)

    # ---- Persist ----
    faiss.write_index(index, str(index_path))
    chunks_path.write_text(json.dumps(all_chunks, ensure_ascii=False), encoding="utf-8")

    logger.info(
        "[store_embeddings_in_faiss] saved %d vectors (%d existing + %d new) to %s",
        index.ntotal, len(existing_chunks), len(chunk_metas), index_path,
    )

    return index_path


# ---------------------------------------------------------------------------
# Load index
# ---------------------------------------------------------------------------

def load_faiss_index(index_name: str = "default") -> tuple[faiss.Index, list[dict]]:
    index_path = VECTORSTORE_DIR / f"{index_name}.index"
    chunks_path = VECTORSTORE_DIR / f"{index_name}_chunks.json"

    logger.info("[load_faiss_index] index_path=%s  exists=%s", index_path, index_path.exists())
    logger.info("[load_faiss_index] chunks_path=%s  exists=%s", chunks_path, chunks_path.exists())

    if not index_path.exists() or not chunks_path.exists():
        raise FileNotFoundError(f"FAISS index '{index_name}' not found in {VECTORSTORE_DIR}")

    index = faiss.read_index(str(index_path))
    chunks = _load_existing_chunks(chunks_path)

    logger.info("[load_faiss_index] vectors=%d  chunks=%d  dim=%d", index.ntotal, len(chunks), index.d)

    if index.ntotal != len(chunks):
        raise ValueError(
            f"Corrupt index '{index_name}': index has {index.ntotal} vectors but "
            f"{len(chunks)} chunks were saved. Re-ingest/rebuild the index."
        )

    return index, chunks


# ---------------------------------------------------------------------------
# Search
# ---------------------------------------------------------------------------

def search_faiss_index(
    query_embedding: list[float],
    index: faiss.Index,
    chunks: list[dict],
    top_k: int = 5,
) -> list[dict]:
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

    results: list[dict] = []
    for score, idx in zip(scores[0], indices[0]):
        idx = int(idx)
        if idx == -1:
            continue
        entry = dict(chunks[idx])      # copy so we don't mutate stored data
        entry["score"] = float(score)
        results.append(entry)

    logger.info("[search_faiss_index] returning %d results", len(results))
    return results


def search_similar_chunks(
    question: str,
    index_name: str = "default",
    top_k: int = 5,
) -> list[dict]:
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
    top_k: int = 5,
) -> tuple[list[dict], str | None]:
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
