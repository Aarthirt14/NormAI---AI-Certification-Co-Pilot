# NormAI — AI Certification Co-Pilot 🛡️🤖

> **Smart India Hackathon (SIH) 2026 — Problem Statement 26107**  
> *An AI-powered co-pilot assisting MSMEs and manufacturers through Bureau of Indian Standards (BIS) regulatory compliance, quality control orders (QCOs), and pre-audit readiness checks.*

---

## 🌟 Architecture & Tech Stack

```
                                  ┌───────────────────────────┐
                                  │   Next.js 14 App Router   │
                                  │   React 18 + Tailwind CSS │
                                  └─────────────┬─────────────┘
                                                │ REST API
                                                ▼
                                  ┌───────────────────────────┐
                                  │      FastAPI Backend      │
                                  └─────────────┬─────────────┘
                                                │
       ┌───────────────────┬────────────────────┼────────────────────┬───────────────────┐
       ▼                   ▼                    ▼                    ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌───────────────────┐  ┌───────────────┐   ┌───────────────┐
│  PostgreSQL  │   │  LangChain   │   │  Tesseract OCR /  │  │ Dynamic Risk  │   │  Google RAG   │
│  (DB + CTE)  │   │ Orchestrator │   │ PyPDF Extraction  │  │ Pattern Engine│   │  (Gemini API) │
└──────────────┘   └──────────────┘   └───────────────────┘  └───────────────┘   └───────────────┘
```

### Core Technologies
* **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons.
* **Backend**: Python 3.11/3.14, FastAPI, Uvicorn, SQLAlchemy ORM, Pydantic v2.
* **Database**: PostgreSQL (port 5433 / default 5432) with native JSONB support and standard `float8[]` array / `pgvector` extension support.
* **Orchestration & LLM**: LangChain (`langchain-google-genai`), Google Gemini 1.5 Flash (`google-genai`), Google `text-embedding-004` (768-dim embeddings).
* **Document Processing & OCR**: `pytesseract` (Tesseract OCR binary fallback for scanned PDFs/images), `pdfplumber`, `PIL/Pillow`, `pdf2image`.
* **Knowledge Graph**: 3-hop recursive SQL Common Table Expression (CTE) graph engine for standards lineage, amendments, and supersessions.

---

## 🚀 Key Modules & Capabilities

1. **Ask NormAI (AI Query Assistant)**: Natural-language product classification and RAG-based standard matching with inline clause citations.
2. **Standards Finder**: Search and rank active Indian Standards (IS codes), QCO applicability status, mandatory schemes, and lab requirements.
3. **Compliance Check**: Pre-audit gap detector running extracted product specification fields against a curated database of 12 critical risk patterns (IS 302-2-14, IS 302-1, IS 694, IS 1293).
4. **Document Analysis**: Upload specification sheets (`.pdf`, `.jpg`, `.png`), extract technical attributes, and view word-level confidence scores.
5. **Standards Graph**: Interactive Knowledge Graph visualization showing parent, child, amendment, and supersession relationships between standards.
6. **BIS Services**: Interactive CM/L licence lookup, BIS-recognized lab finder, and application fee estimator.
7. **Consumer Assist**: Fake ISI mark verification tool and consumer grievance guidance.
8. **Saved Reports**: Export detailed compliance readiness audit reports.

---

## 🛠️ Quick Start & Installation

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+
- PostgreSQL 14+
- *(Optional)* [Tesseract OCR Binary](https://github.com/UB-Mannheim/tesseract/wiki) installed to `C:\Program Files\Tesseract-OCR` or added to system PATH.

---

### 1. Database Setup
Create a PostgreSQL database named `normai`:
```sql
CREATE DATABASE normai;
```

---

### 2. Backend Setup
```bash
cd backend

# Create environment file
cp .env.example .env

# Install dependencies
pip install -r requirements.txt

# Run database migrations and seed data
python scripts/migrate.py
python scripts/seed.py

# (Optional) Generate embeddings for seeded standards
python scripts/embed_clauses.py

# Start FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Backend running at*: `http://127.0.0.1:8000`  
*API Docs*: `http://127.0.0.1:8000/api/docs`

---

### 3. Frontend Setup
```bash
# In the project root directory
npm install

# Start Next.js development server
npm run dev
```
*Frontend running at*: `http://localhost:3000`

---

## 🧪 Live Verification & Audit Endpoints

Judges and evaluators can verify the running system using these endpoints:

```bash
# 1. Tech Stack Audit (reports genuine execution status of all claims)
curl http://127.0.0.1:8000/api/tech-stack

# 2. Standards Graph Lineage Traversal (Recursive CTE query)
curl http://127.0.0.1:8000/api/standards/IS%20302-2-14/lineage

# 3. Dynamic Pre-Audit Compliance Check
curl -X POST http://127.0.0.1:8000/api/compliance/check \
  -H "Content-Type: application/json" \
  -d '{"standard_code": "IS 302-2-14"}'

# 4. LangChain RAG Query Assistant
curl -X POST http://127.0.0.1:8000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "I manufacture a 750W mixer grinder for domestic use in India"}'
```

---

## 📄 License

Developed for **Smart India Hackathon 2026**. All rights reserved.
