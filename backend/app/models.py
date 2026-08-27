"""
NormAI Database Models
All SQLAlchemy ORM table definitions.
"""
import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime,
    ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database import Base, HAS_DB_VECTOR
import enum

# pgvector — graceful import (falls back to plain array if database extension not active)
if HAS_DB_VECTOR:
    try:
        from pgvector.sqlalchemy import Vector as PGVector
        _EMBEDDING_COL = lambda: Column(PGVector(768), nullable=True)  # noqa: E731
    except ImportError:
        from sqlalchemy import ARRAY
        _EMBEDDING_COL = lambda: Column(ARRAY(Float), nullable=True)  # noqa: E731
else:
    from sqlalchemy import ARRAY
    _EMBEDDING_COL = lambda: Column(ARRAY(Float), nullable=True)  # noqa: E731




def new_uuid():
    return str(uuid.uuid4())


# ─── ENUMS ────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    USER = "USER"
    ADMIN = "ADMIN"
    REVIEWER = "REVIEWER"


class StandardStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    AMENDED = "AMENDED"
    SUPERSEDED = "SUPERSEDED"
    WITHDRAWN = "WITHDRAWN"
    UNDER_REVIEW = "UNDER_REVIEW"


class MandatoryStatus(str, enum.Enum):
    MANDATORY_QCO = "MANDATORY (QCO)"
    VOLUNTARY = "VOLUNTARY"


class DocumentStatus(str, enum.Enum):
    UPLOADED = "UPLOADED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class AnalysisType(str, enum.Enum):
    STANDARD_MATCH = "STANDARD_MATCH"
    COMPLIANCE_CHECK = "COMPLIANCE_CHECK"
    DOCUMENT_ANALYSIS = "DOCUMENT_ANALYSIS"


class AnalysisStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


class FindingSeverity(str, enum.Enum):
    CRITICAL = "CRITICAL"
    ATTENTION = "ATTENTION"
    PASSED = "PASSED"
    INFO = "INFO"


class FindingStatus(str, enum.Enum):
    SATISFIED = "SATISFIED"
    POTENTIALLY_MISSING = "POTENTIALLY_MISSING"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    MANUAL_REVIEW_REQUIRED = "MANUAL_REVIEW_REQUIRED"


class RelationshipType(str, enum.Enum):
    PARENT = "PARENT"
    REFERENCES = "REFERENCES"
    RELATED_TO = "RELATED_TO"
    AMENDS = "AMENDS"
    AMENDED_BY = "AMENDED_BY"
    SUPERSEDES = "SUPERSEDES"
    SUPERSEDED_BY = "SUPERSEDED_BY"
    PART_OF = "PART_OF"


class LicenceStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"
    CANCELLED = "CANCELLED"


# ─── TABLES ───────────────────────────────────────────────────────────────────

class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String(255), nullable=False)
    organization_type = Column(String(100))
    industry = Column(String(100))
    city = Column(String(100))
    state = Column(String(100))
    country = Column(String(100), default="India")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    users = relationship("User", back_populates="organization")
    products = relationship("Product", back_populates="organization")


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(512), nullable=False)
    role = Column(SAEnum(UserRole), default=UserRole.USER)
    preferred_language = Column(String(10), default="en")
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

    organization = relationship("Organization", back_populates="users")
    products = relationship("Product", back_populates="user")
    documents = relationship("Document", back_populates="user")
    reports = relationship("Report", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")
    analysis_runs = relationship("AnalysisRun", back_populates="user")
    readiness_assessments = relationship("ReadinessAssessment", back_populates="user")


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    manufacturer = Column(String(255), nullable=True)
    model_number = Column(String(100), nullable=True)
    rated_voltage = Column(String(50), nullable=True)
    rated_power = Column(String(50), nullable=True)
    frequency = Column(String(50), nullable=True)
    insulation_class = Column(String(20), nullable=True)
    intended_use = Column(String(255), nullable=True)
    metadata_ = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="products")
    organization = relationship("Organization", back_populates="products")
    documents = relationship("Document", back_populates="product")


class Standard(Base):
    __tablename__ = "standards"

    id = Column(String, primary_key=True, default=new_uuid)
    standard_code = Column(String(100), unique=True, nullable=False, index=True)
    title = Column(String(512), nullable=False)
    full_title = Column(Text)
    description = Column(Text)
    scope = Column(Text)
    category = Column(String(150))
    edition = Column(String(50))
    publication_year = Column(Integer, nullable=True)
    status = Column(SAEnum(StandardStatus), default=StandardStatus.ACTIVE)
    mandatory_status = Column(String(100), default="VOLUNTARY")
    scheme = Column(String(100))
    qco_details = Column(Text, nullable=True)
    effective_date = Column(String(100), nullable=True)
    withdrawal_date = Column(String(100), nullable=True)
    source_url = Column(String(512), nullable=True)
    match_score = Column(Integer, nullable=True)
    why_matched = Column(JSONB, default=list)
    why_not_applied = Column(Text, nullable=True)
    applicable_products = Column(JSONB, default=list)
    amendments_count = Column(Integer, default=0)
    last_verified = Column(String(255), nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    clauses = relationship("StandardClause", back_populates="standard", cascade="all, delete-orphan")
    outgoing_relationships = relationship(
        "StandardRelationship",
        foreign_keys="StandardRelationship.source_standard_id",
        back_populates="source_standard"
    )
    incoming_relationships = relationship(
        "StandardRelationship",
        foreign_keys="StandardRelationship.target_standard_id",
        back_populates="target_standard"
    )
    amendments = relationship("StandardAmendment", back_populates="standard")
    timeline = relationship("StandardTimeline", back_populates="standard")


class StandardClause(Base):
    __tablename__ = "standard_clauses"

    id = Column(String, primary_key=True, default=new_uuid)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=False, index=True)
    clause_number = Column(String(100), nullable=False)
    title = Column(String(512))
    clause_text = Column(Text)
    highlighted_text = Column(Text, nullable=True)
    used_to_support = Column(Text, nullable=True)
    amendment_note = Column(Text, nullable=True)
    page_number = Column(Integer, nullable=True)
    clause_status = Column(String(50), default="ACTIVE")
    metadata_ = Column("metadata", JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    standard = relationship("Standard", back_populates="clauses")
    # 768-dim semantic embedding for pgvector cosine-similarity search
    embedding = _EMBEDDING_COL()



class StandardRelationship(Base):
    __tablename__ = "standard_relationships"

    id = Column(String, primary_key=True, default=new_uuid)
    source_standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    target_standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    relationship_type = Column(SAEnum(RelationshipType), nullable=False)
    year = Column(String(10), nullable=True)
    effective_date = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)

    source_standard = relationship("Standard", foreign_keys=[source_standard_id], back_populates="outgoing_relationships")
    target_standard = relationship("Standard", foreign_keys=[target_standard_id], back_populates="incoming_relationships")


class StandardAmendment(Base):
    __tablename__ = "standard_amendments"

    id = Column(String, primary_key=True, default=new_uuid)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    amendment_number = Column(String(50))
    title = Column(String(512))
    publication_year = Column(Integer, nullable=True)
    effective_date = Column(String(100), nullable=True)
    status = Column(String(50), default="ACTIVE")
    source_url = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)

    standard = relationship("Standard", back_populates="amendments")


class StandardTimeline(Base):
    __tablename__ = "standard_timelines"

    id = Column(String, primary_key=True, default=new_uuid)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=False)
    year = Column(String(10))
    event = Column(Text)
    timeline_status = Column(String(20), default="past")

    standard = relationship("Standard", back_populates="timeline")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    original_filename = Column(String(512), nullable=False)
    stored_filename = Column(String(512), nullable=False)
    file_type = Column(String(50))
    mime_type = Column(String(100))
    file_size = Column(Integer)
    page_count = Column(Integer, nullable=True)
    storage_path = Column(String(1024))
    status = Column(SAEnum(DocumentStatus), default=DocumentStatus.UPLOADED)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="documents")
    product = relationship("Product", back_populates="documents")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String, primary_key=True, default=new_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False, index=True)
    field_name = Column(String(255), nullable=False)
    field_value = Column(Text)
    normalized_value = Column(String(512), nullable=True)
    confidence = Column(Float, default=0.0)
    page_number = Column(Integer, nullable=True)
    source_text = Column(Text, nullable=True)
    bounding_box = Column(JSONB, nullable=True)
    category = Column(String(50), default="general")
    created_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document", back_populates="extracted_fields")


class AnalysisRun(Base):
    __tablename__ = "analysis_runs"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    analysis_type = Column(SAEnum(AnalysisType))
    status = Column(SAEnum(AnalysisStatus), default=AnalysisStatus.QUEUED)
    current_step = Column(String(100), nullable=True)
    progress = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    result_data = Column(JSONB, default=dict)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="analysis_runs")


class ReadinessAssessment(Base):
    __tablename__ = "readiness_assessments"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=True)
    analysis_run_id = Column(String, ForeignKey("analysis_runs.id"), nullable=True)
    readiness_score = Column(Float, default=0.0)
    status = Column(String(100), default="Needs Attention")
    passed_count = Column(Integer, default=0)
    attention_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="readiness_assessments")
    findings = relationship("ComplianceFinding", back_populates="assessment", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="assessment")


class ComplianceFinding(Base):
    __tablename__ = "compliance_findings"

    id = Column(String, primary_key=True, default=new_uuid)
    assessment_id = Column(String, ForeignKey("readiness_assessments.id"), nullable=False, index=True)
    standard_id = Column(String, ForeignKey("standards.id"), nullable=True)
    clause_id = Column(String, ForeignKey("standard_clauses.id"), nullable=True)
    title = Column(String(512), nullable=False)
    section = Column(String(200))
    severity = Column(SAEnum(FindingSeverity), default=FindingSeverity.INFO)
    finding_status = Column(SAEnum(FindingStatus), default=FindingStatus.INSUFFICIENT_EVIDENCE)
    requirement = Column(Text)
    observed = Column(Text)
    recommended_action = Column(Text)
    clause_citation = Column(String(255), nullable=True)
    standard_code = Column(String(100), nullable=True)
    clause_number = Column(String(100), nullable=True)
    confidence = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    assessment = relationship("ReadinessAssessment", back_populates="findings")


class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=new_uuid)
    report_number = Column(String(100), unique=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    product_id = Column(String, ForeignKey("products.id"), nullable=True)
    assessment_id = Column(String, ForeignKey("readiness_assessments.id"), nullable=True)
    title = Column(String(512), nullable=False)
    status = Column(String(50), default="FINAL")
    report_data = Column(JSONB, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="reports")
    assessment = relationship("ReadinessAssessment", back_populates="reports")


class Laboratory(Base):
    __tablename__ = "laboratories"

    id = Column(String, primary_key=True, default=new_uuid)
    name = Column(String(512), nullable=False)
    city = Column(String(100))
    state = Column(String(100))
    address = Column(Text, nullable=True)
    recognized_for = Column(JSONB, default=list)
    supported_standards = Column(JSONB, default=list)
    recognition_status = Column(String(50), default="ACTIVE")
    turnaround_days = Column(String(50))
    contact = Column(String(255))
    sample_type = Column(String(255), nullable=True)
    source_url = Column(String(512), nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Licence(Base):
    __tablename__ = "licences"

    id = Column(String, primary_key=True, default=new_uuid)
    licence_number = Column(String(100), unique=True, nullable=False, index=True)
    registration_type = Column(String(50), default="CM/L")
    manufacturer = Column(String(512))
    product = Column(String(512))
    standard_code = Column(String(100))
    factory = Column(String(512))
    scope = Column(Text)
    valid_from = Column(String(50))
    valid_until = Column(String(50))
    status = Column(SAEnum(LicenceStatus), default=LicenceStatus.ACTIVE)
    source_url = Column(String(512), nullable=True)
    is_demo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String(512), nullable=True)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"

    id = Column(String, primary_key=True, default=new_uuid)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    role = Column(String(20), nullable=False)  # "user" | "assistant"
    content = Column(Text, nullable=False)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    conversation = relationship("Conversation", back_populates="messages")
    citations = relationship("MessageCitation", back_populates="message", cascade="all, delete-orphan")


class MessageCitation(Base):
    __tablename__ = "message_citations"

    id = Column(String, primary_key=True, default=new_uuid)
    message_id = Column(String, ForeignKey("messages.id"), nullable=False)
    clause_id = Column(String, ForeignKey("standard_clauses.id"), nullable=True)
    relevance_score = Column(Float, default=0.0)
    citation_label = Column(String(255))

    message = relationship("Message", back_populates="citations")
