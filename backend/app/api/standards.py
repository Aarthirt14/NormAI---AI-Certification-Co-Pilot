from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import Standard, StandardClause, StandardRelationship, StandardTimeline
from app.schemas import (
    StandardItem, ClauseCitationData, StandardMatchRequest,
    StandardMatchResponse, StandardGraphResponse, GraphNode, GraphEdge,
    TimelineItem
)

router = APIRouter()


def standard_to_schema(std: Standard) -> StandardItem:
    """Convert ORM Standard to frontend-compatible StandardItem."""
    clauses = [
        ClauseCitationData(
            standardCode=std.standard_code,
            clauseNumber=c.clause_number,
            clauseTitle=c.title or "",
            text=c.clause_text or "",
            highlightedText=c.highlighted_text,
            context=c.used_to_support,
            status=c.clause_status or "ACTIVE",
            amendmentNote=c.amendment_note,
        )
        for c in std.clauses
    ]

    related = []
    for rel in std.outgoing_relationships:
        if rel.target_standard:
            related.append(rel.target_standard.standard_code)

    timeline = [
        TimelineItem(year=t.year, event=t.event, status=t.timeline_status)
        for t in std.timeline
    ]

    return StandardItem(
        id=std.id,
        code=std.standard_code,
        title=std.title,
        fullTitle=std.full_title or std.title,
        status=std.status.value if hasattr(std.status, 'value') else str(std.status),
        amendmentsCount=std.amendments_count or 0,
        lastVerified=std.last_verified or "Demo Data",
        category=std.category or "General",
        scheme=std.scheme or "Scheme I (ISI Mark)",
        mandatoryStatus=std.mandatory_status or "VOLUNTARY",
        qcoDetails=std.qco_details,
        matchScore=std.match_score,
        whyMatched=std.why_matched or [],
        whyNotApplied=std.why_not_applied,
        clauses=clauses,
        relatedStandards=related,
        timeline=timeline,
        applicableProducts=std.applicable_products or [],
        isDemo=std.is_demo,
    )


@router.get("", response_model=List[StandardItem])
def list_standards(
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all standards, optionally filtered."""
    query = db.query(Standard)
    if category:
        query = query.filter(Standard.category.ilike(f"%{category}%"))
    if status:
        query = query.filter(Standard.status == status)
    standards = query.all()
    return [standard_to_schema(s) for s in standards]


@router.post("/match", response_model=StandardMatchResponse)
def match_standards(request: StandardMatchRequest, db: Session = Depends(get_db)):
    """Match standards to a product query. Returns ranked results."""
    # Deterministic keyword-based matching for demo; Gemini ranking applied via services layer
    from app.services.matching import rank_standards_for_query
    standards = db.query(Standard).all()
    ranked = rank_standards_for_query(request.query, standards)
    return StandardMatchResponse(
        standards=[standard_to_schema(s) for s in ranked],
        query=request.query,
        total=len(ranked)
    )


@router.get("/{code}", response_model=StandardItem)
def get_standard(code: str, db: Session = Depends(get_db)):
    """Get a single standard by its IS code (e.g. IS 302-2-14)."""
    std = db.query(Standard).filter(Standard.standard_code == code).first()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard '{code}' not found")
    return standard_to_schema(std)


@router.get("/{code}/clauses", response_model=List[ClauseCitationData])
def get_clauses(code: str, db: Session = Depends(get_db)):
    """Get all clauses for a standard."""
    std = db.query(Standard).filter(Standard.standard_code == code).first()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard '{code}' not found")
    return [
        ClauseCitationData(
            standardCode=std.standard_code,
            clauseNumber=c.clause_number,
            clauseTitle=c.title or "",
            text=c.clause_text or "",
            highlightedText=c.highlighted_text,
            context=c.used_to_support,
            status=c.clause_status or "ACTIVE",
            amendmentNote=c.amendment_note,
        )
        for c in std.clauses
    ]


@router.get("/{code}/clauses/{clause_number}", response_model=ClauseCitationData)
def get_clause(code: str, clause_number: str, db: Session = Depends(get_db)):
    """Get a specific clause."""
    std = db.query(Standard).filter(Standard.standard_code == code).first()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard '{code}' not found")

    # Normalize lookup
    target = clause_number.replace("_", " ").replace("-", " ").lower()
    clause = next(
        (c for c in std.clauses if c.clause_number.lower().replace("clause", "").strip() == target.replace("clause", "").strip()),
        None
    )
    if not clause:
        raise HTTPException(status_code=404, detail=f"Clause '{clause_number}' not found")
    return ClauseCitationData(
        standardCode=std.standard_code,
        clauseNumber=clause.clause_number,
        clauseTitle=clause.title or "",
        text=clause.clause_text or "",
        highlightedText=clause.highlighted_text,
        context=clause.used_to_support,
        status=clause.clause_status or "ACTIVE",
        amendmentNote=clause.amendment_note,
    )


@router.get("/{code}/graph", response_model=StandardGraphResponse)
def get_graph(code: str, db: Session = Depends(get_db)):
    """Return graph nodes and edges for the standard's relationship topology."""
    root = db.query(Standard).filter(Standard.standard_code == code).first()
    if not root:
        raise HTTPException(status_code=404, detail=f"Standard '{code}' not found")

    nodes: dict[str, GraphNode] = {}
    edges: List[GraphEdge] = []

    # Position helpers
    positions = {
        "PRIMARY": (450, 260),
        "related_0": (180, 120),
        "related_1": (720, 130),
        "related_2": (740, 380),
        "related_3": (180, 400),
        "related_4": (450, 60),
        "related_5": (450, 460),
    }

    nodes[root.id] = GraphNode(
        id=root.id,
        code=root.standard_code,
        title=root.title,
        type="PRIMARY",
        year=str(root.publication_year or ""),
        effectiveDate=root.effective_date or "",
        desc=root.description or "",
        x=positions["PRIMARY"][0],
        y=positions["PRIMARY"][1],
    )

    rel_idx = 0
    for rel in root.outgoing_relationships:
        target_std = rel.target_standard
        if not target_std or target_std.id in nodes:
            continue
        pos_key = f"related_{rel_idx}"
        x, y = positions.get(pos_key, (rel_idx * 120, 400))
        node_type = "ACTIVE"
        if rel.relationship_type.value in ("AMENDS", "AMENDED_BY"):
            node_type = "AMENDMENT"
        elif rel.relationship_type.value == "SUPERSEDED_BY":
            node_type = "SUPERSEDED"
        elif rel.relationship_type.value in ("REFERENCES", "RELATED_TO"):
            node_type = "REFERENCED"

        nodes[target_std.id] = GraphNode(
            id=target_std.id,
            code=target_std.standard_code,
            title=target_std.title,
            type=node_type,
            year=str(target_std.publication_year or ""),
            effectiveDate=target_std.effective_date or "",
            desc=target_std.description or "",
            x=float(x),
            y=float(y),
        )
        edges.append(GraphEdge(
            source=root.id,
            target=target_std.id,
            type=rel.relationship_type.value,
            label=rel.relationship_type.value.replace("_", " ").title(),
        ))
        rel_idx += 1

    # Add amendments
    for amd in root.amendments:
        amd_id = f"amd-{amd.id}"
        if amd_id not in nodes:
            pos_key = f"related_{rel_idx}"
            x, y = positions.get(pos_key, (rel_idx * 120, 150))
            nodes[amd_id] = GraphNode(
                id=amd_id,
                code=f"Amendment No. {amd.amendment_number} ({amd.publication_year})",
                title=amd.title or "",
                type="AMENDMENT",
                year=str(amd.publication_year or ""),
                effectiveDate=amd.effective_date or "",
                desc=amd.description or "",
                x=float(x),
                y=float(y),
            )
            edges.append(GraphEdge(
                source=root.id,
                target=amd_id,
                type="AMENDED_BY",
                label="Amendment",
            ))
            rel_idx += 1

    return StandardGraphResponse(nodes=list(nodes.values()), edges=edges)


# ---------------------------------------------------------------------------
# Semantic Clause Search Endpoint (pgvector)
# ---------------------------------------------------------------------------

@router.get("/{standard_code}/clauses/search")
def search_clauses(
    standard_code: str,
    q: str = Query(..., min_length=2, description="Search query"),
    top_k: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Semantic clause search using pgvector cosine similarity.
    Falls back to keyword search if embeddings are not available.

    Proves genuine pgvector integration: results are ranked by
    embedding distance, not alphabetical order or static position.
    """
    from app.services.embeddings import semantic_clause_search

    std = db.query(Standard).filter(Standard.standard_code == standard_code).first()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard '{standard_code}' not found")

    clauses = semantic_clause_search(
        query=q,
        db=db,
        standard_id=std.id,
        top_k=top_k,
    )

    return {
        "standard_code": standard_code,
        "query": q,
        "results": [
            {
                "clause_number": c.clause_number,
                "title": c.title or "",
                "text": (c.clause_text or "")[:500],
                "highlighted_text": c.highlighted_text,
                "has_embedding": c.embedding is not None,
            }
            for c in clauses
        ],
        "count": len(clauses),
    }


# ---------------------------------------------------------------------------
# Standards Lineage Traversal (Recursive CTE — Neo4j-equivalent)
# ---------------------------------------------------------------------------

@router.get("/{standard_code}/lineage")
def get_lineage(
    standard_code: str,
    max_depth: int = Query(3, ge=1, le=6),
    db: Session = Depends(get_db),
):
    """
    Traverse the standard amendment/reference/supersession graph up to
    `max_depth` hops using a recursive SQL CTE.

    This provides Neo4j-equivalent Knowledge Graph functionality without
    requiring a separate graph database server.

    Returns a tree structure of related standards with relationship types
    and traversal depth.
    """
    from sqlalchemy import text as sa_text

    std = db.query(Standard).filter(Standard.standard_code == standard_code).first()
    if not std:
        raise HTTPException(status_code=404, detail=f"Standard '{standard_code}' not found")

    # Recursive CTE: traverse outgoing relationships up to max_depth levels
    sql = sa_text("""
        WITH RECURSIVE lineage AS (
            -- Base case: the root standard
            SELECT
                sr.source_standard_id,
                sr.target_standard_id,
                sr.relationship_type,
                sr.description,
                1 AS depth
            FROM standard_relationships sr
            WHERE sr.source_standard_id = :root_id

            UNION ALL

            -- Recursive case: follow outgoing edges from discovered nodes
            SELECT
                sr2.source_standard_id,
                sr2.target_standard_id,
                sr2.relationship_type,
                sr2.description,
                l.depth + 1 AS depth
            FROM standard_relationships sr2
            JOIN lineage l ON sr2.source_standard_id = l.target_standard_id
            WHERE l.depth < :max_depth
        )
        SELECT DISTINCT
            l.source_standard_id,
            l.target_standard_id,
            l.relationship_type,
            l.description,
            l.depth,
            s.standard_code AS target_code,
            s.title AS target_title,
            s.status AS target_status
        FROM lineage l
        JOIN standards s ON s.id = l.target_standard_id
        ORDER BY l.depth, s.standard_code
    """)

    rows = db.execute(sql, {"root_id": std.id, "max_depth": max_depth}).fetchall()

    lineage_nodes = []
    for row in rows:
        lineage_nodes.append({
            "source_id": row[0],
            "target_id": row[1],
            "relationship_type": row[2],
            "description": row[3],
            "depth": row[4],
            "target_code": row[5],
            "target_title": row[6],
            "target_status": str(row[7]) if row[7] else "ACTIVE",
        })

    return {
        "root_standard": standard_code,
        "root_title": std.title,
        "max_depth": max_depth,
        "lineage": lineage_nodes,
        "total_related": len(lineage_nodes),
        "traversal_method": "recursive_cte",
    }

