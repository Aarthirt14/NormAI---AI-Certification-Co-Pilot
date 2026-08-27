"""
scripts/embed_clauses.py
========================
One-shot script: generates 768-dim embeddings for all StandardClause rows
and writes them into the pgvector `embedding` column.

Run AFTER pgvector extension is installed in PostgreSQL:
    psql normai -c "CREATE EXTENSION IF NOT EXISTS vector;"

Then:
    cd backend
    python scripts/embed_clauses.py

The script is idempotent — clauses that already have an embedding are skipped.
"""
import sys
import os

# Make sure we can import the app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
logger = logging.getLogger("embed_clauses")

from app.database import SessionLocal
from app.models import StandardClause
from app.services.embeddings import embed_text, PGVECTOR_AVAILABLE

if not PGVECTOR_AVAILABLE:
    logger.error(
        "pgvector Python package is not installed or could not be imported. "
        "Run: pip install pgvector"
    )
    sys.exit(1)


def run():
    db = SessionLocal()
    try:
        clauses = db.query(StandardClause).all()
        total = len(clauses)
        to_embed = [c for c in clauses if c.embedding is None]
        logger.info(f"Total clauses: {total} | Needing embeddings: {len(to_embed)}")

        embedded = 0
        failed = 0
        for i, clause in enumerate(to_embed, 1):
            text = " ".join(filter(None, [
                clause.title,
                clause.clause_text,
                clause.highlighted_text,
                clause.used_to_support,
            ]))
            if not text.strip():
                logger.warning(f"[{i}/{len(to_embed)}] Clause {clause.clause_number}: no text, skipping.")
                continue

            vec = embed_text(text)
            if vec:
                clause.embedding = vec
                embedded += 1
                logger.info(f"[{i}/{len(to_embed)}] Embedded clause {clause.clause_number} ({len(vec)}-dim)")
            else:
                failed += 1
                logger.warning(f"[{i}/{len(to_embed)}] Clause {clause.clause_number}: embedding failed (no API key?)")

            # Commit in batches of 10
            if i % 10 == 0:
                db.commit()
                logger.info(f"Committed batch at clause {i}")

        db.commit()
        logger.info(f"\nDone. Embedded: {embedded} | Failed/skipped: {failed} | Already had embedding: {total - len(to_embed)}")

    except Exception as e:
        logger.error(f"Fatal error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
