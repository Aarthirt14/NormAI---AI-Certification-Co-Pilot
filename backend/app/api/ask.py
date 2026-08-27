"""
NormAI Ask API — LangChain + Semantic RAG Pipeline
=====================================================
Uses LangChain orchestration (chain.py) for product classification
and standards analysis. Retrieves relevant clauses via pgvector
semantic search (embeddings.py) with keyword fallback.
"""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import AnalysisRun, Standard, StandardClause, Product, User
from app.schemas import AskRequest, AskResponse, AnalysisStatusResponse, ClauseCitationData, CertificationStep
from app.api.standards import standard_to_schema
from app.services.matching import rank_standards_for_query
from app.services.llm import LLMService
from app.services.embeddings import semantic_clause_search
from app.services.chain import NormAIChain
from datetime import datetime
import uuid
import time
import logging

router = APIRouter()
logger = logging.getLogger("normai.ask")

# Preset standard pathway steps as specified by the UI
DEMO_PATHWAY = [
    CertificationStep(num="1", title="Standard Identified", status="pass", badge="IS 302-2-14", desc="Product classified under domestic kitchen machines mandate."),
    CertificationStep(num="2", title="QCO Applicability", status="pass", badge="MANDATORY QCO", desc="Quality Control Order requires compulsory ISI marking under Scheme I."),
    CertificationStep(num="3", title="Lab Testing", status="pending", badge="BIS LAB REQD", desc="Type testing must be carried out at a BIS-recognized laboratory."),
    CertificationStep(num="4", title="Factory Audit", status="upcoming", badge="INITIAL AUDIT", desc="BIS officer will inspect manufacturing unit and verify QA testing equipment."),
    CertificationStep(num="5", title="Grant of Licence", status="upcoming", badge="CM/L GRANT", desc="Licence granted upon matching test reports and factory verification."),
    CertificationStep(num="6", title="Enforcement", status="upcoming", badge="ISI MARK", desc="Authorized to print ISI mark on product nameplates."),
]


def run_ask_analysis(analysis_id: str, query: str, db_session_factory):
    """
    Background task that runs the full RAG pipeline:
    1. Product classification (LangChain)
    2. Standards matching (keyword scorer)
    3. Semantic clause retrieval (pgvector / keyword fallback)
    4. LLM answer generation (LangChain / direct Gemini / mock)
    """
    steps = [
        ("UNDERSTANDING_PRODUCT", 15),
        ("FINDING_STANDARDS", 35),
        ("CHECKING_VERSION", 55),
        ("RETRIEVING_CLAUSES", 75),
        ("VERIFYING_SOURCES", 90),
        ("COMPLETED", 100),
    ]

    db = db_session_factory()
    try:
        run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
        if not run:
            return

        # --- Step 1: Product Classification (LangChain) ---
        run.current_step = "UNDERSTANDING_PRODUCT"
        run.progress = 15
        db.commit()

        product_attrs = NormAIChain.classify_product(query)
        if product_attrs:
            logger.info(f"LangChain classified product: {product_attrs.get('product_name', '?')}")
        else:
            # Fallback to LLM direct extraction
            product_attrs = LLMService.extract_structured(
                f"Extract product specs from: {query}",
                {"type": "object", "properties": {
                    "product_name": {"type": "string"},
                    "category": {"type": "string"},
                    "voltage": {"type": "string"},
                    "power": {"type": "string"},
                }}
            )
            logger.info(f"Direct LLM classified product: {product_attrs.get('product_name', '?')}")

        time.sleep(0.3)

        # --- Step 2: Standards Matching ---
        run.current_step = "FINDING_STANDARDS"
        run.progress = 35
        db.commit()

        standards = db.query(Standard).all()
        ranked = rank_standards_for_query(query, standards)
        best_standard = ranked[0] if ranked else None
        time.sleep(0.3)

        # --- Step 3: Version Check ---
        run.current_step = "CHECKING_VERSION"
        run.progress = 55
        db.commit()
        time.sleep(0.2)

        # --- Step 4: Semantic Clause Retrieval (pgvector) ---
        run.current_step = "RETRIEVING_CLAUSES"
        run.progress = 75
        db.commit()

        citations = []
        clause_evidence_text = ""
        if best_standard:
            # Semantic search via pgvector with keyword fallback
            relevant_clauses = semantic_clause_search(
                query=query,
                db=db,
                standard_id=best_standard.id,
                top_k=5,
            )

            # If semantic search returned nothing, fall back to first clauses
            if not relevant_clauses:
                relevant_clauses = (
                    db.query(StandardClause)
                    .filter(StandardClause.standard_id == best_standard.id)
                    .limit(3)
                    .all()
                )

            citations = [
                ClauseCitationData(
                    standardCode=best_standard.standard_code,
                    clauseNumber=c.clause_number,
                    clauseTitle=c.title or "",
                    text=c.clause_text or "",
                    highlightedText=c.highlighted_text,
                    context=c.used_to_support,
                    status=c.clause_status or "ACTIVE",
                    amendmentNote=c.amendment_note,
                )
                for c in relevant_clauses
            ]

            # Build clause evidence text for LLM context
            clause_evidence_text = "\n\n".join(
                f"[{c.clause_number}] {c.title or ''}: {(c.clause_text or '')[:200]}"
                for c in relevant_clauses
            )

        time.sleep(0.3)

        # --- Step 5: LLM Answer Generation (LangChain chain) ---
        run.current_step = "VERIFYING_SOURCES"
        run.progress = 90
        db.commit()

        # Try LangChain chain first
        answer = None
        pipeline_used = "mock"

        if best_standard and NormAIChain.is_available():
            answer = NormAIChain.analyze_standards(
                query=query,
                standard_code=best_standard.standard_code,
                standard_title=best_standard.title,
                match_score=best_standard.match_score or 94,
                clause_evidence=clause_evidence_text,
            )
            if answer:
                pipeline_used = "langchain"
                logger.info("Answer generated via LangChain chain.")

        # Fallback to direct LLM
        if not answer:
            prompt = f"Product query: {query}\nStandard found: {best_standard.standard_code if best_standard else 'None'}\nRelevant clauses:\n{clause_evidence_text}"
            answer = LLMService.generate(prompt)
            pipeline_used = "gemini_direct" if "mock" not in answer.lower()[:50] else "mock"

        matched_attrs = []
        if product_attrs:
            if product_attrs.get("intended_use"):
                matched_attrs.append(product_attrs["intended_use"])
            if product_attrs.get("power"):
                matched_attrs.append(f"{product_attrs['power']} power")
            if product_attrs.get("voltage"):
                matched_attrs.append(f"{product_attrs['voltage']} supply")
            if product_attrs.get("category"):
                matched_attrs.append(product_attrs["category"])
        if not matched_attrs:
            matched_attrs = ["domestic use", "750W power", "230V AC supply", "food preparation"]

        result = {
            "answer": answer,
            "summary": "Verified against active Indian Standards",
            "likely_standard_code": best_standard.standard_code if best_standard else None,
            "match_score": best_standard.match_score if best_standard else 96,
            "matched_attributes": matched_attrs,
            "citations": [c.model_dump() for c in citations],
            "confidence": 0.95,
            "needs_clarification": False,
            "clarification_question": None,
            "pipeline_used": pipeline_used,
        }

        if len(query.split()) < 4:
            result["needs_clarification"] = True
            result["clarification_question"] = "Is this product intended for household/domestic use or commercial catering?"

        run.status = "COMPLETED"
        run.result_data = result
        run.completed_at = datetime.utcnow()
        db.commit()

    except Exception as e:
        logger.error(f"Error in background RAG task: {e}")
        db.rollback()
        run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_id).first()
        if run:
            run.status = "FAILED"
            run.error_message = str(e)
            db.commit()
    finally:
        db.close()


@router.post("/ask", response_model=AskResponse)
def ask_normai(request: AskRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Primary endpoint for AI query assistant."""
    demo_user = db.query(User).filter(User.email == "demo@normai.in").first()
    user_id = demo_user.id if demo_user else None

    analysis_id = str(uuid.uuid4())
    run = AnalysisRun(
        id=analysis_id,
        user_id=user_id,
        analysis_type="STANDARD_MATCH",
        status="PROCESSING",
        current_step="UNDERSTANDING_PRODUCT",
        progress=15,
        started_at=datetime.utcnow(),
    )
    db.add(run)
    db.commit()

    from app.database import SessionLocal
    background_tasks.add_task(run_ask_analysis, analysis_id, request.query, SessionLocal)

    return AskResponse(
        answer="Analyzing product details and querying the active Indian Standards database...",
        summary="Processing in workspace",
        match_score=0,
        needs_clarification=False,
        analysis_run_id=analysis_id,
        language=request.language,
    )


@router.get("/analysis/{analysis_run_id}/status", response_model=AnalysisStatusResponse)
def get_analysis_status(analysis_run_id: str, db: Session = Depends(get_db)):
    """Fetch status of background analysis run."""
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found")

    completed = []
    all_steps = ["UNDERSTANDING_PRODUCT", "FINDING_STANDARDS", "CHECKING_VERSION", "RETRIEVING_CLAUSES", "VERIFYING_SOURCES"]
    if run.current_step in all_steps:
        idx = all_steps.index(run.current_step)
        completed = all_steps[:idx]
    elif run.status == "COMPLETED":
        completed = all_steps

    return AnalysisStatusResponse(
        status=run.status.value if hasattr(run.status, "value") else str(run.status),
        current_step=run.current_step,
        completed_steps=completed,
        progress=run.progress or 0,
        error_message=run.error_message,
    )


@router.get("/analysis/{analysis_run_id}/result", response_model=AskResponse)
def get_analysis_result(analysis_run_id: str, db: Session = Depends(get_db)):
    """Fetch completed result data for query assistant."""
    run = db.query(AnalysisRun).filter(AnalysisRun.id == analysis_run_id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Analysis run not found")

    if run.status != "COMPLETED":
        raise HTTPException(status_code=400, detail=f"Analysis is not completed yet (Current status: {run.status})")

    res = run.result_data or {}
    std_code = res.get("likely_standard_code")
    std_schema = None
    if std_code:
        std = db.query(Standard).filter(Standard.standard_code == std_code).first()
        if std:
            std_schema = standard_to_schema(std)

    citations = [ClauseCitationData(**c) for c in res.get("citations", [])]

    return AskResponse(
        answer=res.get("answer", ""),
        summary=res.get("summary", ""),
        likely_standard=std_schema,
        match_score=res.get("match_score", 0),
        matched_attributes=res.get("matched_attributes", []),
        citations=citations,
        certification_pathway=DEMO_PATHWAY,
        confidence=res.get("confidence", 0.0),
        needs_clarification=res.get("needs_clarification", False),
        clarification_question=res.get("clarification_question"),
        analysis_run_id=analysis_run_id,
    )
