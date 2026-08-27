"""
NormAI FastAPI Application — Main entry point.
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("normai")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables on startup."""
    logger.info("NormAI backend starting up...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created/verified.")

    # Create upload directories
    settings = get_settings()
    for dir_path in [settings.UPLOAD_DIRECTORY, settings.GENERATED_DIRECTORY]:
        os.makedirs(dir_path, exist_ok=True)
    logger.info("Storage directories ready.")

    yield

    logger.info("NormAI backend shutting down.")


settings = get_settings()

app = FastAPI(
    title="NormAI API",
    description="AI Certification Co-Pilot Backend — Smart India Hackathon 2026 (PS 26107)",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS — allow the Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routers
from app.api import health, auth, standards, ask, documents, compliance, reports, labs, consumer, services

app.include_router(health.router, prefix="/api", tags=["Health"])
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(standards.router, prefix="/api/standards", tags=["Standards"])
app.include_router(ask.router, prefix="/api", tags=["Ask NormAI"])
app.include_router(documents.router, prefix="/api/documents", tags=["Documents"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(labs.router, prefix="/api/labs", tags=["Labs"])
app.include_router(consumer.router, prefix="/api/consumer", tags=["Consumer"])
app.include_router(services.router, prefix="/api/bis-services", tags=["BIS Services"])
