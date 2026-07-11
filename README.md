# 🏥 Intelligent Medical Inventory Agent using RAG

> AI-powered Medical Inventory Assistant built using **Retrieval-Augmented Generation (RAG)**, **FastAPI**, **FAISS**, **Sentence Transformers**, **Groq LLM**, and **React.js**.

![Python](https://img.shields.io/badge/Python-3.13-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![Groq](https://img.shields.io/badge/Groq-LLM-orange)
![FAISS](https://img.shields.io/badge/FAISS-Vector%20Database-red)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 📌 Overview

Traditional AI chatbots answer using their pre-trained knowledge, which may not contain your organization's private documents.

This project solves that problem using **Retrieval-Augmented Generation (RAG)**.

Users upload medical inventory PDFs, which are converted into embeddings and stored inside a FAISS vector database. Whenever a question is asked, the system retrieves the most relevant document chunks and sends only those to the Groq LLM, ensuring responses are grounded in the uploaded documents.

---

# 🚀 Live Demo

### 🌐 Frontend

> https://YOUR-VERCEL-URL.vercel.app

### ⚙️ Backend API

> https://YOUR-RAILWAY-URL.up.railway.app/docs

---

# ✨ Features

- 📄 Upload Medical PDF Documents
- 🤖 AI-powered Question Answering
- 📚 Multi-document RAG Support
- 🔍 Semantic Search using FAISS
- 🧠 Sentence Transformer Embeddings
- ⚡ Groq LLM Integration
- 📑 Source Citation with Confidence Score
- 🎯 Demo PDF Library
- 🌐 Railway Deployment
- ⚛️ React + Vite Frontend
- 📱 Responsive Modern UI

---

# 🏗 System Architecture

```
                 User
                   │
                   ▼
        React Frontend (Vercel)
                   │
        REST API Requests
                   │
                   ▼
      FastAPI Backend (Railway)
                   │
      ┌────────────┴────────────┐
      │                         │
Upload PDF               Ask Question
      │                         │
      ▼                         ▼
 PDF Reader             Query Embedding
      │                         │
Chunking                 FAISS Search
      │                         │
Embeddings               Top-K Chunks
      │                         │
      └────────────┬────────────┘
                   ▼
              Groq LLM
                   │
                   ▼
          AI Generated Answer
```

---

# 🔄 RAG Workflow

```
Upload PDF
     │
     ▼
Extract Text
     │
     ▼
Chunk Text
     │
     ▼
Generate Embeddings
     │
     ▼
Store in FAISS
     │
──────────────
User Question
     │
     ▼
Question Embedding
     │
     ▼
Similarity Search
     │
     ▼
Top Relevant Chunks
     │
     ▼
Groq LLM
     │
     ▼
Final Answer + Sources
```

---

# 🛠 Tech Stack

## Frontend

- React.js
- Vite
- Axios
- Tailwind CSS

## Backend

- FastAPI
- Uvicorn
- Python

## AI / RAG

- Groq API
- Sentence Transformers
- FAISS
- pypdf

## Deployment

- Railway
- Vercel
- GitHub

---

# 📂 Project Structure

```
Medical-Inventory-Agent
│
├── app/
│   ├── pipeline/
│   ├── routers/
│   ├── utils/
│   └── main.py
│
├── frontend/
│
├── data/
│
├── uploads/
│
├── vectorstore/
│
├── requirements.txt
├── .env.example
└── README.md
```

---

# ⚙️ Installation

Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
```

Go inside the project

```bash
cd Intelligent-Medical-Inventory-Agent
```

Create virtual environment

```bash
python -m venv .venv
```

Activate

### Windows

```bash
.venv\Scripts\activate
```

### Linux / macOS

```bash
source .venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

---

# 🔑 Environment Variables

Create a `.env`

```env
GROQ_API_KEY=your_groq_api_key
```

---

# ▶️ Run Backend

```bash
python -m uvicorn app.main:app --reload
```

Swagger

```
http://127.0.0.1:8000/docs
```

---

# ▶️ Run Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📸 Screenshots

## Home Page

(Add Screenshot)

---

## Upload PDF

(Add Screenshot)

---

## AI Response

(Add Screenshot)

---

## Swagger API

(Add Screenshot)

---

## Railway Deployment

(Add Screenshot)

---

# 🎯 Example Questions

- How should insulin be stored?
- What is the dosage of Paracetamol?
- What are the contraindications of Ibuprofen?
- What medicines require refrigeration?
- What are the storage instructions for vaccines?

---

# 📈 Future Improvements

- Voice Assistant
- OCR Support
- Multi-language Support
- Chat History
- User Authentication
- Cloud Storage
- Hybrid Search
- Re-ranking
- Streaming Responses
- Citation Highlighting

---

# 📚 Learning Outcomes

Through this project I learned:

- Retrieval-Augmented Generation (RAG)
- Semantic Search
- Vector Databases
- FAISS
- Sentence Transformers
- Prompt Engineering
- FastAPI
- REST APIs
- Railway Deployment
- Vercel Deployment
- React Integration
- AI Application Development

---

# 👨‍💻 Author

**Thenith Ranjan P. S**

Computer Science Engineering Student

Easwari Engineering College

📧 Email: thenithranjan@gmail.com

🔗 LinkedIn: https://www.linkedin.com/in/thenith-ranjan-p-s/

💻 GitHub: https://github.com/Thenithranjan

---

# ⭐ Support

If you found this project useful, please consider giving it a ⭐ on GitHub!

---

# 📄 License

This project is licensed under the MIT License.
