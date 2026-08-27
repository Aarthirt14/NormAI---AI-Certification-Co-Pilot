from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Report, ReadinessAssessment, User, Product, Standard
from app.schemas import ReportCreate, ReportOut
from datetime import datetime
import uuid

router = APIRouter()


@router.post("", response_model=ReportOut)
def create_report(request: ReportCreate, db: Session = Depends(get_db)):
    """Save compliance assessment results as a persistent report dossier."""
    assessment = db.query(ReadinessAssessment).filter(ReadinessAssessment.id == request.assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    demo_user = db.query(User).filter(User.email == "demo@normai.in").first()
    user_id = demo_user.id if demo_user else None

    # Generate print report details
    findings_list = []
    for f in assessment.findings:
        findings_list.append({
            "id": f.id,
            "title": f.title,
            "severity": f.severity.value if hasattr(f.severity, 'value') else str(f.severity),
            "clauseCitation": f.clause_citation or "",
            "standardCode": f.standard_code or "",
            "clauseNumber": f.clause_number or "",
            "requirement": f.requirement,
            "observed": f.observed,
            "recommendedAction": f.recommended_action,
            "status": "fail" if f.severity.value == "CRITICAL" else ("warning" if f.severity.value == "ATTENTION" else "pass"),
            "section": f.section
        })

    std = assessment.findings[0].standard_code if assessment.findings else "IS 302-2-14"

    report_data = {
        "report_id": f"NORMAI-2026-MG750-V{len(db.query(Report).all()) + 1}",
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "readiness_score": assessment.readiness_score,
        "critical_count": assessment.critical_count,
        "attention_count": assessment.attention_count,
        "passed_count": assessment.passed_count,
        "product_info": {
            "name": "NX-750 Turbo Mixer Grinder",
            "model": "NX-750",
            "manufacturer": "SIH MSME Appliances Ltd",
            "rating": "750W, 230V, 50Hz, Class I"
        },
        "standard_info": {
            "code": std,
            "title": "Kitchen Machines Safety Standard",
            "scheme": "Scheme I (ISI Mark)",
            "mandatory": "MANDATORY (QCO)"
        },
        "findings": findings_list,
        "priority_actions": [
            "Revise laser marking drawing (Doc Ref: ART-MG-04) to include rated voltage unit (V) and frequency symbol (Hz).",
            "Conduct and submit locked-rotor abnormal test curves according to Clause 19.11 requirements.",
            "Acquire and attach supplier IS 694 ISI test certificate for BoM Item #14 (PVC flexible cord)."
        ]
    }

    # ID mapping
    report_id = str(uuid.uuid4())
    report_num = report_data["report_id"]

    report = Report(
        id=report_id,
        report_number=report_num,
        user_id=user_id,
        product_id=request.product_id,
        assessment_id=request.assessment_id,
        title=request.title,
        status="FINAL",
        report_data=report_data,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=list[ReportOut])
def get_reports(db: Session = Depends(get_db)):
    """Fetch all saved compliance reports."""
    return db.query(Report).order_by(Report.created_at.desc()).all()


@router.get("/{id}", response_model=ReportOut)
def get_report_details(id: str, db: Session = Depends(get_db)):
    """Get a single report by ID."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report


@router.delete("/{id}")
def delete_report(id: str, db: Session = Depends(get_db)):
    """Delete a report by ID."""
    report = db.query(Report).filter(Report.id == id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    db.delete(report)
    db.commit()
    return {"status": "SUCCESS", "message": f"Report '{id}' deleted"}
