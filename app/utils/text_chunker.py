from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_text(
    text: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[str]:
    if not text or not text.strip():
        return []

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )

    return splitter.split_text(text)


def chunk_text_with_metadata(
    pages: list[dict],
    source: str,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> list[dict]:
    """Chunk page-level text and attach source/page metadata.

    Parameters
    ----------
    pages : list[dict]
        Output of ``read_pdf_pages()`` — ``[{"page": 1, "text": "..."}, ...]``.
    source : str
        Original PDF filename (e.g. ``"Medicine Manual.pdf"``).

    Returns
    -------
    list[dict]
        ``[{"chunk": "...", "source": "...", "page": 1}, ...]``
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", " ", ""],
    )

    enriched: list[dict] = []
    for page_info in pages:
        page_num = page_info["page"]
        text = page_info["text"]
        if not text or not text.strip():
            continue
        for chunk in splitter.split_text(text):
            enriched.append({
                "chunk": chunk,
                "source": source,
                "page": page_num,
            })

    return enriched
