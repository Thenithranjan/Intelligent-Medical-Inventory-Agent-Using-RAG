import os

from dotenv import load_dotenv
from groq import Groq

from app.utils.faiss_store import search_similar_chunks

load_dotenv()

DEFAULT_MODEL = "llama-3.3-70b-versatile"


def _get_api_key() -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError(
            "GROQ_API_KEY not found. Add it to a .env file in the project root."
        )
    return api_key


def build_rag_prompt(question: str, retrieved: list[dict]) -> str:
    """Build a prompt that includes source attribution in the context."""
    context_parts: list[str] = []
    for item in retrieved:
        source = item.get("source", "unknown")
        page = item.get("page", "?")
        chunk = item.get("chunk", "")
        context_parts.append(f"[Source: {source}, Page {page}]\n{chunk}")

    context = "\n\n".join(context_parts)

    return f"""You are a helpful medical inventory assistant.
Answer the user's question using ONLY the context below.
If the context does not contain enough information, say you don't know.

After your answer, list the sources you used in this format:
Sources:
- Filename (Page X)

Context:
{context}

Question: {question}

Answer:"""


def ask_groq(
    question: str,
    retrieved: list[dict],
    model_name: str = DEFAULT_MODEL,
) -> str:
    if not question or not question.strip():
        raise ValueError("question cannot be empty.")

    if not retrieved:
        raise ValueError("retrieved chunks cannot be empty.")

    client = Groq(api_key=_get_api_key())
    prompt = build_rag_prompt(question.strip(), retrieved)
    try:
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model=model_name,
        )
    except Exception as e:
        raise ValueError(f"Groq API Error: {e}")

    return chat_completion.choices[0].message.content


def answer_with_rag(
    question: str,
    index_name: str = "default",
    top_k: int = 5,
    model_name: str = DEFAULT_MODEL,
) -> dict[str, str | list[dict]]:
    retrieved = search_similar_chunks(question, index_name=index_name, top_k=top_k)

    if not retrieved:
        return {
            "answer": "No relevant context found in the knowledge base.",
            "sources": [],
            "sources_summary": [],
        }

    answer = ask_groq(question, retrieved, model_name=model_name)

    # Build a deduplicated human-readable sources summary
    seen = set()
    sources_summary: list[str] = []
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
