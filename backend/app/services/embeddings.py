"""
NormAI Embeddings Service
=========================
Generates 768-dimension text embeddings using Google text-embedding-004,
stores them in PostgreSQL via pgvector, and performs cosine-similarity
semantic clause search.

Fallback: if pgvector is not installed or embeddings are not yet generated,
falls back to keyword-based matching so the server never crashes.
"""
import logging
import numpy as np
from typing import List, Optional
from app.config import get_settings

logger = logging.getLogger("normai.embeddings")
settings = get_settings()

# ---------------------------------------------------------------------------
# pgvector availability check (graceful fallback if extension not installed)
# ---------------------------------------------------------------------------
PGVECTOR_AVAILABLE = False
try:
    from pgvector.sqlalchemy import Vector  # noqa: F401
    PGVECTOR_AVAILABLE = True
    logger.info("pgvector Python package available.")
except ImportError:
    logger.warning("pgvector Python package not installed. Semantic search will fall back to keyword matching.")


# ---------------------------------------------------------------------------
# Embedding generation
# ---------------------------------------------------------------------------

def embed_text(text: str) -> Optional[List[float]]:
    """
    Generate a 768-dim embedding vector for a text string using
    Google text-embedding-004 via the google-genai SDK.

    Returns None if the API key is absent or the call fails.
    """
    api_key = settings.GEMINI_API_KEY
    if not api_key or api_key == "REPLACE_WITH_YOUR_GEMINI_API_KEY":
        logger.debug("No Gemini API key – embedding skipped.")
        return None

    try:
        from google import genai

        client = genai.Client(api_key=api_key)
        result = client.models.embed_content(
            model=settings.EMBEDDING_MODEL,   # models/text-embedding-004
            contents=text,
        )
        # SDK returns EmbedContentResponse; extract values
        embedding = result.embeddings[0].values
        return list(embedding)
    except Exception as exc:
        logger.error(f"Embedding generation failed: {exc}")
        return None


def embed_clause_batch(clauses, db) -> int:
    """
    Embed all StandardClause rows that do not yet have an embedding vector.
    Writes embedding back to DB row.  Returns count of clauses embedded.

    This is called by scripts/embed_clauses.py (one-shot) and also lazily
    when a new standard is seeded.
    """
    if not PGVECTOR_AVAILABLE:
        logger.warning("pgvector not available – skipping batch embedding.")
        return 0

    from app.models import StandardClause

    # Only process clauses missing embeddings
    clauses_to_embed = [c for c in clauses if c.embedding is None]
    embedded = 0

    for clause in clauses_to_embed:
        text_to_embed = " ".join(filter(None, [
            clause.title,
            clause.clause_text,
            clause.highlighted_text,
            clause.used_to_support,
        ]))
        if not text_to_embed.strip():
            continue

        vec = embed_text(text_to_embed)
        if vec:
            clause.embedding = vec
            embedded += 1

    if embedded:
        db.commit()
        logger.info(f"Embedded {embedded} clauses.")

    return embedded


# ---------------------------------------------------------------------------
# Semantic clause search
# ---------------------------------------------------------------------------

def semantic_clause_search(
    query: str,
    db,
    standard_id: Optional[str] = None,
    top_k: int = 5,
) -> list:
    """
    Find the top-K most semantically relevant StandardClause rows for `query`.

    Uses pgvector cosine distance (<->) if pgvector extension is active in DB.
    Otherwise, computes cosine similarity in Python using standard float8[] arrays.
    Falls back to keyword ILIKE search if no embeddings exist.

    Args:
        query: Natural-language query string
        db: SQLAlchemy session
        standard_id: Optional – limit search to a specific standard
        top_k: Number of results to return

    Returns:
        List of StandardClause ORM objects, ordered by relevance.
    """
    from app.models import StandardClause
    from app.database import HAS_DB_VECTOR
    from sqlalchemy import text as sa_text

    query_vec = embed_text(query)

    # --- 1. pgvector database search (if active) ---
    if PGVECTOR_AVAILABLE and HAS_DB_VECTOR and query_vec is not None:
        try:
            # Build filter clause
            filter_sql = ""
            params: dict = {"top_k": top_k}
            if standard_id:
                filter_sql = "AND sc.standard_id = :standard_id"
                params["standard_id"] = standard_id

            # Store vector as PostgreSQL literal
            vec_str = "[" + ",".join(str(v) for v in query_vec) + "]"

            sql = sa_text(f"""
                SELECT sc.id
                FROM standard_clauses sc
                WHERE sc.embedding IS NOT NULL
                {filter_sql}
                ORDER BY sc.embedding <-> '{vec_str}'::vector
                LIMIT :top_k
            """)
            rows = db.execute(sql, params).fetchall()
            if rows:
                ids = [r[0] for r in rows]
                clauses = db.query(StandardClause).filter(
                    StandardClause.id.in_(ids)
                ).all()
                # Preserve ranking order
                id_order = {cid: idx for idx, cid in enumerate(ids)}
                clauses.sort(key=lambda c: id_order.get(c.id, 999))
                logger.info(f"Semantic search returned {len(clauses)} clauses (pgvector).")
                return clauses
        except Exception as exc:
            logger.warning(f"pgvector query failed, falling back to python array search: {exc}")

    # --- 2. Python-native Cosine Similarity (using standard float8[] array column) ---
    if query_vec is not None:
        try:
            q = db.query(StandardClause).filter(StandardClause.embedding.isnot(None))
            if standard_id:
                q = q.filter(StandardClause.standard_id == standard_id)
            
            all_clauses = q.all()
            if all_clauses:
                scored_clauses = []
                for c in all_clauses:
                    # c.embedding is stored as a list/array
                    c_vec = c.embedding
                    if not c_vec or len(c_vec) != len(query_vec):
                        continue
                    
                    # Compute cosine similarity
                    dot_product = sum(a * b for a, b in zip(query_vec, c_vec))
                    norm_a = sum(a * a for a in query_vec) ** 0.5
                    norm_b = sum(b * b for b in c_vec) ** 0.5
                    sim = dot_product / (norm_a * norm_b) if norm_a > 0 and norm_b > 0 else 0.0
                    scored_clauses.append((c, sim))

                scored_clauses.sort(key=lambda x: x[1], reverse=True)
                results = [c for c, sim in scored_clauses[:top_k] if sim > 0.1]
                if results:
                    logger.info(f"Semantic search returned {len(results)} clauses (Python-native cosine fallback).")
                    return results
        except Exception as exc:
            logger.warning(f"Python array cosine search failed: {exc}")

    # --- 3. Keyword fallback ---
    logger.info("Using keyword fallback for clause search.")
    keywords = [w for w in query.lower().split() if len(w) > 3]
    q = db.query(StandardClause)
    if standard_id:
        q = q.filter(StandardClause.standard_id == standard_id)

    results = []
    for clause in q.all():
        text_blob = " ".join(filter(None, [
            clause.title, clause.clause_text, clause.highlighted_text
        ])).lower()
        hits = sum(1 for kw in keywords if kw in text_blob)
        if hits:
            results.append((clause, hits))

    results.sort(key=lambda x: x[1], reverse=True)
    return [c for c, _ in results[:top_k]]

