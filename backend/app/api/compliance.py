"""
NormAI Compliance Check API
=============================
Runs pre-audit gap checks using the DynamicComplianceChecker engine
which cross-references extracted document fields against the curated
compliance_risk_patterns.json dataset.

No more hardcoded findings — every finding is generated dynamically
from the document content.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    ReadinessAssessment, ComplianceFinding, Standard, StandardClause,
    Document, ExtractedField, User, FindingSeverity, FindingStatus
)
from app.schemas import ComplianceCheckRequest, ComplianceCheckResponse, ComplianceFindingOut
from app.services.compliance_engine import DynamicComplianceChecker
import uuid
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger("normai.compliance")


def calculate_readiness_score(passed: int, attention: int, critical: int) -> float:
    """
    NormAI Readiness Score Formula:
    - Base score: 100
    - CRITICAL findings penalty: -12 points each
    - ATTENTION findings penalty: -5 points each
    - PASSED findings: 0 penalty
    - Score is capped between 0 and 100.
    """
    score = 100.0 - (critical * 12.0) - (attention * 5.0)
    return max(0.0, min(100.0, score))


@router.post("/check", response_model=ComplianceCheckResponse)
def check_compliance(request: ComplianceCheckRequest, db: Session = Depends(get_db)):
    """Run a pre-audit gap check on the product spec document against the standard."""
    std = db.query(Standard).filter(Standard.standard_code == request.standard_code).first()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard '{request.standard_code}' not found")

    demo_user = db.query(User).filter(User.email == "demo@normai.in").first()
    user_id = demo_user.id if demo_user else None

    # Retrieve extracted fields from the document (if provided)
    extracted_fields = []
    if request.document_id:
        extracted_fields = db.query(ExtractedField).filter(
            ExtractedField.document_id == request.document_id
        ).all()
        logger.info(f"Found {len(extracted_fields)} extracted fields for document {request.document_id}")

    # ─── Dynamic compliance check ───────────────────────────────────────
    # This replaces the old hardcoded findings list.
    # DynamicComplianceChecker cross-references each pattern's evidence
    # keywords against the extracted document field values.
    finding_dicts = DynamicComplianceChecker.check(
        standard_code=request.standard_code,
        extracted_fields=extracted_fields,
        db=db,
        use_llm_observed=True,
    )

    # Convert dicts to ORM ComplianceFinding objects
    findings = []
    assessment_id = str(uuid.uuid4())

    for idx, fd in enumerate(finding_dicts):
        f = ComplianceFinding(
            id=f"finding-{assessment_id}-{idx}",
            assessment_id=assessment_id,
            standard_id=std.id,
            title=fd["title"],
            section=fd["section"],
            severity=fd["severity"],
            finding_status=fd["finding_status"],
            requirement=fd["requirement"],
            observed=fd["observed"],
            recommended_action=fd["recommended_action"],
            clause_citation=fd["clause_citation"],
            standard_code=fd["standard_code"],
            clause_number=fd["clause_number"],
            confidence=fd.get("confidence", 0.0),
        )
        findings.append(f)

    # Calculate counts
    critical = sum(1 for f in findings if f.severity == FindingSeverity.CRITICAL)
    attention = sum(1 for f in findings if f.severity == FindingSeverity.ATTENTION)
    passed = sum(1 for f in findings if f.severity == FindingSeverity.PASSED)

    score = calculate_readiness_score(passed, attention, critical)
    status_label = "Ready" if score >= 90 else ("Needs Attention" if score >= 60 else "Critical Action Required")

    # Save readiness assessment
    assessment = ReadinessAssessment(
        id=assessment_id,
        user_id=user_id,
        standard_id=std.id,
        readiness_score=score,
        status=status_label,
        passed_count=passed,
        attention_count=attention,
        critical_count=critical,
        summary=f"Dynamic compliance evaluation completed. {len(extracted_fields)} document fields cross-referenced against {len(finding_dicts)} risk patterns.",
        created_at=datetime.utcnow()
    )
    db.add(assessment)

    for f in findings:
        db.add(f)

    db.commit()

    # Map to response schema
    mapped_findings = [
        ComplianceFindingOut(
            id=f.id,
            title=f.title,
            severity=f.severity.value,
            clauseCitation=f.clause_citation or "",
            standardCode=f.standard_code or "",
            clauseNumber=f.clause_number or "",
            requirement=f.requirement,
            observed=f.observed,
            recommendedAction=f.recommended_action,
            status="fail" if f.severity == FindingSeverity.CRITICAL else ("warning" if f.severity == FindingSeverity.ATTENTION else "pass"),
            section=f.section,
        )
        for f in findings
    ]

    return ComplianceCheckResponse(
        assessment_id=assessment_id,
        readiness_score=score,
        status_label=status_label,
        passed_count=passed,
        attention_count=attention,
        critical_count=critical,
        findings=mapped_findings,
        standard_code=request.standard_code,
        summary=assessment.summary,
    )


@router.get("/{assessment_id}/findings", response_model=ComplianceCheckResponse)
def get_findings(assessment_id: str, db: Session = Depends(get_db)):
    """Fetch completed compliance check findings."""
    assessment = db.query(ReadinessAssessment).filter(ReadinessAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    findings = db.query(ComplianceFinding).filter(ComplianceFinding.assessment_id == assessment_id).all()
    mapped_findings = [
        ComplianceFindingOut(
            id=f.id,
            title=f.title,
            severity=f.severity.value if hasattr(f.severity, 'value') else str(f.severity),
            clauseCitation=f.clause_citation or "",
            standardCode=f.standard_code or "",
            clauseNumber=f.clause_number or "",
            requirement=f.requirement,
            observed=f.observed,
            recommendedAction=f.recommended_action,
            status="fail" if f.severity == FindingSeverity.CRITICAL else ("warning" if f.severity == FindingSeverity.ATTENTION else "pass"),
            section=f.section,
        )
        for f in findings
    ]

    std_code = assessment.findings[0].standard_code if assessment.findings else "IS 302-2-14"

    return ComplianceCheckResponse(
        assessment_id=assessment_id,
        readiness_score=assessment.readiness_score,
        status_label=assessment.status,
        passed_count=assessment.passed_count,
        attention_count=assessment.attention_count,
        critical_count=assessment.critical_count,
        findings=mapped_findings,
        standard_code=std_code,
        summary=assessment.summary or "",
    )
