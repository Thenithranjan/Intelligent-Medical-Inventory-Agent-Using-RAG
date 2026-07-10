# pyrefly: ignore [missing-import]
import logging

logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import pdf, rag
app = FastAPI(
    title="Medical Inventory Agent",
    description="RAG-powered medical inventory assistant",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://intelligent-medical-inventory-agent.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(pdf.router)
app.include_router(rag.router)


@app.get("/")
async def root():
    return {
        "message": "Intelligent Medical Inventory Agent API is running successfully"
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
