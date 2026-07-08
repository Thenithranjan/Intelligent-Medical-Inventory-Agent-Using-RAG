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


def build_rag_prompt(question: str, context_chunks: list[str]) -> str:
    context = "\n\n".join(f"- {chunk}" for chunk in context_chunks)

    return f"""You are a helpful medical inventory assistant.
Answer the user's question using ONLY the context below.
If the context does not contain enough information, say you don't know.

Context:
{context}

Question: {question}

Answer:"""


def ask_groq(
    question: str,
    context_chunks: list[str],
    model_name: str = DEFAULT_MODEL,
) -> str:
    if not question or not question.strip():
        raise ValueError("question cannot be empty.")

    if not context_chunks:
        raise ValueError("context_chunks cannot be empty.")

    client = Groq(api_key=_get_api_key())
    prompt = build_rag_prompt(question.strip(), context_chunks)
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
    top_k: int = 3,
    model_name: str = DEFAULT_MODEL,
) -> dict[str, str | list[dict[str, float | str]]]:
    retrieved = search_similar_chunks(question, index_name=index_name, top_k=top_k)

    if not retrieved:
        return {
            "answer": "No relevant context found in the knowledge base.",
            "sources": [],
        }

    context_chunks = [str(item["chunk"]) for item in retrieved]
    answer = ask_groq(question, context_chunks, model_name=model_name)

    return {
        "answer": answer,
        "sources": retrieved,
    }
