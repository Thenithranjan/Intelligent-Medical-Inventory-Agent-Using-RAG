from sentence_transformers import SentenceTransformer

DEFAULT_MODEL_NAME = "all-MiniLM-L6-v2"
_models: dict[str, SentenceTransformer] = {}


def _load_model(model_name: str) -> SentenceTransformer:
    if model_name not in _models:
        _models[model_name] = SentenceTransformer(model_name)
    return _models[model_name]


def embed_chunks(
    chunks: list[str],
    model_name: str = DEFAULT_MODEL_NAME,
) -> list[list[float]]:
    if not chunks:
        return []

    model = _load_model(model_name)
    vectors = model.encode(chunks, convert_to_numpy=True)
    return vectors.tolist()
