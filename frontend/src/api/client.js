import axios from 'axios';
import { API } from '../config/api';

const API_BASE = API;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

/** Health-check */
export const checkHealth = () => api.get('/health');

/** Upload PDF — auto-ingests into FAISS */
export const uploadPDF = (file, onUploadProgress) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/pdf/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });
};

/** Manually ingest a PDF already on disk */
export const ingestPDF = (pdfPath, indexName = 'medical_inventory') =>
  api.post('/rag/ingest', { pdf_path: pdfPath, index_name: indexName });

/** Ask the RAG agent */
export const askAgent = (question, indexName = 'medical_inventory', topK = 3) =>
  api.post('/rag/ask', { question, index_name: indexName, top_k: topK });

export default api;
