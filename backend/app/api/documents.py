"""
NormAI Document Upload & Analysis API
=======================================
Handles file uploads, PDF text extraction, and OCR fallback via Tesseract
for scanned PDFs and images (JPG/PNG).
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Document, ExtractedField, User
from app.schemas import DocumentOut, DocumentFieldsResponse, ExtractedDocField
from app.config import get_settings
from app.services.llm import LLMService
from datetime import datetime
import os
import re
import uuid
import logging

router = APIRouter()
logger = logging.getLogger("normai.documents")
settings = get_settings()


# ---------------------------------------------------------------------------
# Tesseract availability check (graceful fallback)
# ---------------------------------------------------------------------------
TESSERACT_AVAILABLE = False
try:
    import pytesseract
    # Try to locate Tesseract binary
    tesseract_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        "/usr/bin/tesseract",
        "/usr/local/bin/tesseract",
    ]
    for tp in tesseract_paths:
        if os.path.isfile(tp):
            pytesseract.pytesseract.tesseract_cmd = tp
            TESSERACT_AVAILABLE = True
            logger.info(f"Tesseract OCR found at: {tp}")
            break
    if not TESSERACT_AVAILABLE:
        # Check if it's on PATH
        try:
            version = pytesseract.get_tesseract_version()
            TESSERACT_AVAILABLE = True
            logger.info(f"Tesseract OCR on PATH, version: {version}")
        except Exception:
            logger.warning("Tesseract binary not found. Image OCR will be unavailable.")
except ImportError:
    logger.warning("pytesseract not installed. Image OCR will be unavailable.")


# ---------------------------------------------------------------------------
# Text extraction pipeline
# ---------------------------------------------------------------------------

def _extract_from_digital_pdf(file_path: str) -> tuple[str, int]:
    """Extract text from a born-digital PDF using pdfplumber. Returns (text, page_count)."""
    import pdfplumber
    with pdfplumber.open(file_path) as pdf:
        page_count = len(pdf.pages)
        pages_text = [page.extract_text() or "" for page in pdf.pages[:5]]
        return " ".join(pages_text), page_count


def _extract_from_image_tesseract(file_path: str) -> tuple[str, float]:
    """
    Run Tesseract OCR on an image file (JPG/PNG).
    Returns (extracted_text, average_confidence).
    """
    if not TESSERACT_AVAILABLE:
        return "", 0.0

    from PIL import Image
    img = Image.open(file_path)

    # Get detailed OCR data with confidence values
    data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)

    words = []
    confidences = []
    for i, text in enumerate(data["text"]):
        text = text.strip()
        conf = int(data["conf"][i])
        if text and conf > 0:
            words.append(text)
            confidences.append(conf)

    full_text = " ".join(words)
    avg_conf = sum(confidences) / len(confidences) / 100.0 if confidences else 0.0

    return full_text, avg_conf


def _extract_from_scanned_pdf(file_path: str) -> tuple[str, int, float]:
    """
    Convert scanned PDF pages to images and run Tesseract OCR.
    Returns (text, page_count, avg_confidence).
    """
    if not TESSERACT_AVAILABLE:
        return "", 1, 0.0

    try:
        from pdf2image import convert_from_path
        images = convert_from_path(file_path, first_page=1, last_page=5, dpi=300)
    except Exception as exc:
        logger.warning(f"pdf2image conversion failed (poppler missing?): {exc}")
        return "", 1, 0.0

    all_text = []
    all_conf = []
    for page_img in images:
        data = pytesseract.image_to_data(page_img, output_type=pytesseract.Output.DICT)
        for i, text in enumerate(data["text"]):
            text = text.strip()
            conf = int(data["conf"][i])
            if text and conf > 0:
                all_text.append(text)
                all_conf.append(conf)

    full_text = " ".join(all_text)
    avg_conf = sum(all_conf) / len(all_conf) / 100.0 if all_conf else 0.0
    return full_text, len(images), avg_conf


def _extract_text_with_fallback(file_path: str, ext: str) -> tuple[str, int, float, str]:
    """
    Unified extraction pipeline:
    1. Digital PDF → pdfplumber
    2. If pdfplumber yields sparse text → Tesseract OCR on PDF pages
    3. Image files → Tesseract directly

    Returns (text, page_count, avg_confidence, extraction_method).
    """
    if ext in (".jpg", ".jpeg", ".png"):
        text, conf = _extract_from_image_tesseract(file_path)
        return text, 1, conf, "tesseract_image"

    if ext == ".pdf":
        # Try digital extraction first
        text, page_count = _extract_from_digital_pdf(file_path)

        # Check if it's a scanned PDF (sparse text)
        words_per_page = len(text.split()) / max(page_count, 1)
        if words_per_page < 20 and TESSERACT_AVAILABLE:
            logger.info(f"Sparse text ({words_per_page:.0f} words/page) — falling back to Tesseract OCR.")
            ocr_text, ocr_pages, ocr_conf = _extract_from_scanned_pdf(file_path)
            if ocr_text.strip():
                return ocr_text, ocr_pages, ocr_conf, "tesseract_scanned_pdf"

        # Digital PDF was fine
        return text, page_count, 0.95, "pdfplumber_digital"

    return "", 1, 0.0, "unsupported"


# ---------------------------------------------------------------------------
# Structured field extraction from raw text
# ---------------------------------------------------------------------------

# Regex patterns for common electrical product parameters
FIELD_PATTERNS = [
    ("Product Name", r"(?:product\s*(?:name|model)?|model)\s*[:\-]?\s*(.+?)(?:\n|$)", "general"),
    ("Rated Power", r"(?:(?:rated\s*)?power|wattage|motor\s*rating)\s*[:\-]?\s*(\d+\s*(?:w|watts?|kw))", "electrical"),
    ("Rated Voltage", r"(?:(?:rated\s*)?voltage|operating\s*voltage|supply\s*voltage)\s*[:\-]?\s*(\d+\s*v(?:\s*ac)?)", "electrical"),
    ("Frequency", r"(?:frequency|freq)\s*[:\-]?\s*(\d+\s*hz)", "electrical"),
    ("Insulation Class", r"(?:insulation\s*class|class)\s*[:\-]?\s*(class\s*[i1I]{1,2}[\s\w]*)", "safety"),
    ("Thermal Overload", r"(?:thermal\s*overload|top|thermal\s*protector|overload\s*protector)\s*[:\-]?\s*(.+?)(?:\n|$)", "safety"),
    ("Cord Specification", r"(?:cord|cable|supply\s*cord|power\s*cord)\s*[:\-]?\s*(.+?)(?:\n|$)", "technical"),
    ("Plug Specification", r"(?:plug|3.pin\s*plug|fitted\s*plug)\s*[:\-]?\s*(.+?)(?:\n|$)", "technical"),
    ("Intended Use", r"(?:intended\s*use|use|application|purpose)\s*[:\-]?\s*(.+?)(?:\n|$)", "general"),
    ("Earth Resistance", r"(?:earth\s*(?:resistance|continuity)|earthing)\s*[:\-]?\s*(.+?)(?:\n|$)", "safety"),
]


def _extract_structured_fields(
    raw_text: str,
    file_name: str,
    avg_confidence: float,
    extraction_method: str,
) -> list[dict]:
    """
    Extract structured fields from raw OCR/PDF text using regex + LLM fallback.
    Returns a list of field dicts ready to be saved as ExtractedField rows.
    """
    fields = []
    text_lower = raw_text.lower()

    for field_name, pattern, category in FIELD_PATTERNS:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            value = match.group(1).strip()
            # Confidence = base OCR confidence * regex match quality
            conf = min(avg_confidence * 1.05, 0.99) if avg_confidence > 0 else 0.85
            fields.append({
                "field_name": field_name,
                "field_value": value,
                "confidence": round(conf, 2),
                "source_text": match.group(0).strip()[:200],
                "category": category,
            })

    # If regex found fewer than 3 fields, try LLM structured extraction
    if len(fields) < 3 and raw_text.strip():
        try:
            schema = {
                "type": "object",
                "properties": {
                    "product_name": {"type": "string"},
                    "rated_power": {"type": "string"},
                    "rated_voltage": {"type": "string"},
                    "frequency": {"type": "string"},
                    "insulation_class": {"type": "string"},
                    "intended_use": {"type": "string"},
                },
            }
            llm_result = LLMService.extract_structured(
                f"Extract product specifications from this text:\n{raw_text[:1500]}",
                schema,
            )
            field_map = {
                "product_name": ("Product Name", "general"),
                "rated_power": ("Rated Power", "electrical"),
                "rated_voltage": ("Rated Voltage", "electrical"),
                "frequency": ("Frequency", "electrical"),
                "insulation_class": ("Insulation Class", "safety"),
                "intended_use": ("Intended Use", "general"),
            }
            existing_names = {f["field_name"] for f in fields}
            for key, (name, cat) in field_map.items():
                val = llm_result.get(key, "")
                if val and val != "Unknown" and name not in existing_names:
                    fields.append({
                        "field_name": name,
                        "field_value": val,
                        "confidence": 0.80,
                        "source_text": f"LLM extraction from {extraction_method}",
                        "category": cat,
                    })
        except Exception as exc:
            logger.warning(f"LLM structured extraction failed: {exc}")

    # Add extraction metadata field
    fields.append({
        "field_name": "_extraction_method",
        "field_value": extraction_method,
        "confidence": 1.0,
        "source_text": f"Extraction pipeline: {extraction_method}",
        "category": "meta",
    })

    return fields


# ---------------------------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------------------------

@router.post("/upload", response_model=DocumentOut)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a specification sheet PDF or image."""
    os.makedirs(settings.UPLOAD_DIRECTORY, exist_ok=True)

    file_id = str(uuid.uuid4())
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".png", ".jpg", ".jpeg", ".docx"]:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    stored_name = f"{file_id}{ext}"
    storage_path = os.path.join(settings.UPLOAD_DIRECTORY, stored_name)

    file_size = 0
    with open(storage_path, "wb") as buffer:
        while content := await file.read(1024 * 1024):
            file_size += len(content)
            buffer.write(content)

    if file_size > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        os.remove(storage_path)
        raise HTTPException(status_code=413, detail=f"File exceeds maximum size of {settings.MAX_UPLOAD_SIZE_MB}MB")

    demo_user = db.query(User).filter(User.email == "demo@normai.in").first()
    user_id = demo_user.id if demo_user else None

    doc = Document(
        id=file_id,
        user_id=user_id,
        original_filename=file.filename,
        stored_filename=stored_name,
        file_type=ext.replace(".", "").upper(),
        mime_type=file.content_type,
        file_size=file_size,
        storage_path=storage_path,
        status="UPLOADED",
        uploaded_at=datetime.utcnow(),
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.post("/{document_id}/analyze")
def analyze_document(document_id: str, db: Session = Depends(get_db)):
    """Run text extraction & structured field parsing on the uploaded document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = "PROCESSING"
    db.commit()

    try:
        ext = os.path.splitext(doc.stored_filename)[1].lower()
        raw_text, page_count, avg_conf, method = _extract_text_with_fallback(doc.storage_path, ext)

        doc.page_count = page_count
        doc.status = "COMPLETED"
        doc.processed_at = datetime.utcnow()

        # Clear existing fields
        db.query(ExtractedField).filter(ExtractedField.document_id == doc.id).delete()

        # Extract structured fields from raw text
        fields = _extract_structured_fields(raw_text, doc.original_filename, avg_conf, method)

        for f in fields:
            ef = ExtractedField(
                id=str(uuid.uuid4()),
                document_id=doc.id,
                field_name=f["field_name"],
                field_value=f["field_value"],
                confidence=f["confidence"],
                page_number=1,
                source_text=f["source_text"],
                category=f["category"],
            )
            db.add(ef)

        db.commit()
        return {
            "status": "SUCCESS",
            "message": f"Document parsed using {method}",
            "extraction_method": method,
            "tesseract_available": TESSERACT_AVAILABLE,
            "fields_extracted": len(fields),
            "avg_confidence": round(avg_conf, 2),
            "raw_text_preview": raw_text[:300] if raw_text else "(empty)",
        }

    except Exception as e:
        logger.error(f"Error analyzing document: {e}")
        doc.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.get("/{document_id}/fields", response_model=DocumentFieldsResponse)
def get_extracted_fields(document_id: str, db: Session = Depends(get_db)):
    """Fetch structured extraction fields for a document."""
    fields = db.query(ExtractedField).filter(ExtractedField.document_id == document_id).all()
    if not fields:
        raise HTTPException(status_code=404, detail="No extracted fields found for this document")

    # Exclude meta fields from the response
    visible = [f for f in fields if not f.field_name.startswith("_")]
    total = len(visible)
    avg_conf = sum(f.confidence for f in visible) / total if total > 0 else 0.0

    mapped = [
        ExtractedDocField(
            id=f.id,
            label=f.field_name,
            value=f.field_value or "",
            confidence=f.confidence,
            pageNumber=f.page_number or 1,
            boundingSnippet=f.source_text or "",
            category=f.category or "general",
        )
        for f in visible
    ]

    return DocumentFieldsResponse(
        document_id=document_id,
        fields=mapped,
        total=total,
        avg_confidence=avg_conf,
    )


@router.get("/{document_id}", response_model=DocumentOut)
def get_document_details(document_id: str, db: Session = Depends(get_db)):
    """Get uploaded document details."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc
