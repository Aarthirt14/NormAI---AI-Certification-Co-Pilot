"""
Pydantic Schemas — Request/Response contracts matching frontend TypeScript types.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime


# ─── AUTH ─────────────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    preferred_language: str = "en"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    full_name: str
    email: str
    preferred_language: str


class UserOut(BaseModel):
    id: str
    full_name: str
    email: str
    preferred_language: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ─── STANDARDS ────────────────────────────────────────────────────────────────

class ClauseCitationData(BaseModel):
    """Matches frontend ClauseCitationData exactly"""
    standardCode: str
    clauseNumber: str
    clauseTitle: str
    text: str
    highlightedText: Optional[str] = None
    context: Optional[str] = None
    editionYear: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    amendmentNote: Optional[str] = None


class TimelineItem(BaseModel):
    year: str
    event: str
    status: str  # 'past' | 'current' | 'future'


class StandardItem(BaseModel):
    """Matches frontend StandardItem exactly"""
    id: str
    code: str
    title: str
    fullTitle: str
    status: str
    amendmentsCount: int
    lastVerified: str
    category: str
    scheme: str
    mandatoryStatus: str
    qcoDetails: Optional[str] = None
    matchScore: Optional[int] = None
    whyMatched: Optional[List[str]] = None
    whyNotApplied: Optional[str] = None
    clauses: List[ClauseCitationData] = []
    relatedStandards: List[str] = []
    timeline: List[TimelineItem] = []
    applicableProducts: List[str] = []
    isDemo: Optional[bool] = True


class StandardMatchRequest(BaseModel):
    query: str
    language: str = "en"
    product_id: Optional[str] = None
    document_id: Optional[str] = None


class StandardMatchResponse(BaseModel):
    standards: List[StandardItem]
    query: str
    total: int


class GraphNode(BaseModel):
    id: str
    code: str
    title: str
    type: str
    year: str
    effectiveDate: str
    desc: str
    x: float
    y: float


class GraphEdge(BaseModel):
    source: str
    target: str
    type: str
    label: str


class StandardGraphResponse(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]


# ─── ASK NORMAI ──────────────────────────────────────────────────────────────

class AskRequest(BaseModel):
    query: str
    language: str = "en"
    product_id: Optional[str] = None
    document_id: Optional[str] = None
    conversation_id: Optional[str] = None


class CertificationStep(BaseModel):
    num: str
    title: str
    status: str
    badge: str
    desc: str


class AskResponse(BaseModel):
    answer: str
    summary: str
    likely_standard: Optional[StandardItem] = None
    match_score: Optional[int] = None
    matched_attributes: List[str] = []
    citations: List[ClauseCitationData] = []
    certification_pathway: List[CertificationStep] = []
    confidence: float = 0.0
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    analysis_run_id: Optional[str] = None
    language: str = "en"


class AnalysisStatusResponse(BaseModel):
    status: str
    current_step: Optional[str] = None
    completed_steps: List[str] = []
    progress: int = 0
    error_message: Optional[str] = None


# ─── DOCUMENTS ───────────────────────────────────────────────────────────────

class ExtractedDocField(BaseModel):
    """Matches frontend ExtractedDocField exactly"""
    id: str
    label: str
    value: str
    confidence: float
    pageNumber: int
    boundingSnippet: str
    category: str


class DocumentOut(BaseModel):
    id: str
    original_filename: str
    file_type: str
    file_size: int
    page_count: Optional[int]
    status: str
    uploaded_at: datetime
    processed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class DocumentFieldsResponse(BaseModel):
    document_id: str
    fields: List[ExtractedDocField]
    total: int
    avg_confidence: float


# ─── COMPLIANCE ──────────────────────────────────────────────────────────────

class ComplianceCheckRequest(BaseModel):
    product_id: Optional[str] = None
    document_id: Optional[str] = None
    standard_code: str = "IS 302-2-14"
    language: str = "en"


class ComplianceFindingOut(BaseModel):
    """Matches frontend ComplianceFinding exactly"""
    id: str
    title: str
    severity: str
    clauseCitation: str
    standardCode: str
    clauseNumber: str
    requirement: str
    observed: str
    recommendedAction: str
    status: str
    section: str


class ComplianceCheckResponse(BaseModel):
    assessment_id: str
    readiness_score: float
    status_label: str
    passed_count: int
    attention_count: int
    critical_count: int
    findings: List[ComplianceFindingOut]
    standard_code: str
    summary: str


# ─── REPORTS ─────────────────────────────────────────────────────────────────

class ReportCreate(BaseModel):
    assessment_id: str
    title: str
    product_id: Optional[str] = None


class ReportOut(BaseModel):
    id: str
    report_number: str
    title: str
    status: str
    created_at: datetime
    updated_at: datetime
    report_data: Dict[str, Any] = {}

    class Config:
        from_attributes = True


# ─── LABS ─────────────────────────────────────────────────────────────────────

class LabCenter(BaseModel):
    """Matches frontend LabCenter exactly"""
    id: str
    name: str
    location: str
    city: str
    state: str
    recognizedFor: List[str]
    relevantIsCodes: List[str]
    recognitionStatus: str
    turnaroundDays: str
    contact: str
    sampleType: str


# ─── CONSUMER ────────────────────────────────────────────────────────────────

class LicenceVerifyRequest(BaseModel):
    licence_number: str


class LicenceVerifyResponse(BaseModel):
    found: bool
    cml_number: str
    status: str
    manufacturer: Optional[str] = None
    product: Optional[str] = None
    standard_code: Optional[str] = None
    factory: Optional[str] = None
    scope: Optional[str] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None
    is_demo: bool = True
    provenance: str = "DEMO"
    error: Optional[str] = None


class ComplaintCreate(BaseModel):
    product_name: str
    licence_number: Optional[str] = None
    complaint_detail: str
    contact_email: Optional[str] = None


# ─── HEALTH ──────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
    database: str
    llm: str
    version: str = "1.0.0"
    timestamp: datetime
