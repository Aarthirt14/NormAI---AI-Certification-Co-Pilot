from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Laboratory
from app.schemas import LabCenter
from typing import List, Optional

router = APIRouter()


@router.get("", response_model=List[LabCenter])
def list_labs(
    state: Optional[str] = None,
    city: Optional[str] = None,
    standard: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Retrieve BIS-recognized testing laboratories from directory."""
    query = db.query(Laboratory)
    if state and state != "All States":
        query = query.filter(Laboratory.state == state)
    if city:
        query = query.filter(Laboratory.city.ilike(f"%{city}%"))
    if standard:
        query = query.filter(Laboratory.supported_standards.contains([standard]))

    labs = query.all()
    return [
        LabCenter(
            id=l.id,
            name=l.name,
            location=f"{l.city}, {l.state}",
            city=l.city or "",
            state=l.state or "",
            recognizedFor=l.recognized_for or [],
            relevantIsCodes=l.supported_standards or [],
            recognitionStatus=l.recognition_status or "ACTIVE",
            turnaroundDays=l.turnaround_days or "14 Days",
            contact=l.contact or "",
            sampleType=l.sample_type or "Electrical Appliance"
        )
        for l in labs
    ]


@router.get("/{id}", response_model=LabCenter)
def get_lab_details(id: str, db: Session = Depends(get_db)):
    """Fetch single laboratory details."""
    l = db.query(Laboratory).filter(Laboratory.id == id).first()
    if not l:
        raise HTTPException(status_code=404, detail="Laboratory not found")
    return LabCenter(
        id=l.id,
        name=l.name,
        location=f"{l.city}, {l.state}",
        city=l.city or "",
        state=l.state or "",
        recognizedFor=l.recognized_for or [],
        relevantIsCodes=l.supported_standards or [],
        recognitionStatus=l.recognition_status or "ACTIVE",
        turnaroundDays=l.turnaround_days or "14 Days",
        contact=l.contact or "",
        sampleType=l.sample_type or "Electrical Appliance"
    )
