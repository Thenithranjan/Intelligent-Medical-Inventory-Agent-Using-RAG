from pathlib import Path

from pypdf import PdfReader


def read_pdf_text(pdf_path: str | Path) -> str:
    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a PDF file, got: {path.suffix}")

    reader = PdfReader(str(path))
    pages_text: list[str] = []

    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages_text.append(text)

    return "\n\n".join(pages_text)


def read_pdf_pages(pdf_path: str | Path) -> list[dict]:
    """Return per-page text as [{"page": 1, "text": "..."}, ...].

    Pages are 1-indexed.  Pages with no extractable text are skipped.
    """
    path = Path(pdf_path)

    if not path.exists():
        raise FileNotFoundError(f"PDF not found: {path}")

    if path.suffix.lower() != ".pdf":
        raise ValueError(f"Expected a PDF file, got: {path.suffix}")

    reader = PdfReader(str(path))
    pages: list[dict] = []

    for page_num, page in enumerate(reader.pages, start=1):
        text = page.extract_text()
        if text:
            pages.append({"page": page_num, "text": text})

    return pages
