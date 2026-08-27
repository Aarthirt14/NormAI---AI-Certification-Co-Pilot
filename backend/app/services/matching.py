"""
NormAI Standard Matching Service.
Ranks standards for a product query using deterministic keyword scoring + optionally Gemini.
"""
from typing import List
from app.models import Standard


# Keyword categories for scoring
ELECTRICAL_APPLIANCE_KEYWORDS = [
    "mixer", "grinder", "blender", "juicer", "food processor", "kitchen machine",
    "household appliance", "electrical appliance", "motor driven", "kitchen",
    "food preparation", "household", "domestic"
]
ELECTRICAL_KEYWORDS = ["volt", "watt", "ac", "50hz", "230v", "220v", "single phase", "electric"]
SAFETY_KEYWORDS = ["safety", "isi", "bis", "certification", "compliance", "qco", "mandatory"]
POWER_TOOL_KEYWORDS = ["drill", "saw", "grinder", "sander", "tool", "power tool"]


def _score_standard_for_query(query: str, std: Standard) -> int:
    q = query.lower()
    score = 0

    # Check if this is a kitchen/food appliance query
    is_kitchen = any(kw in q for kw in ELECTRICAL_APPLIANCE_KEYWORDS)
    is_electrical = any(kw in q for kw in ELECTRICAL_KEYWORDS)

    # Match against standard's applicable products
    if std.applicable_products:
        for prod in std.applicable_products:
            if any(word in q for word in prod.lower().split()):
                score += 30

    # Match against whyMatched tags
    if std.why_matched:
        for tag in std.why_matched:
            tag_words = set(tag.lower().split())
            q_words = set(q.split())
            overlap = len(tag_words & q_words)
            score += overlap * 5

    # Category boosting
    category = (std.category or "").lower()
    if is_kitchen and "household" in category:
        score += 25
    if is_electrical and "electrical" in category:
        score += 15

    # Keyword hits in scope / description
    scope_text = ((std.scope or "") + " " + (std.description or "")).lower()
    for kw in ELECTRICAL_APPLIANCE_KEYWORDS:
        if kw in scope_text:
            score += 3

    # Prefer ACTIVE standards
    status = str(std.status)
    if "ACTIVE" in status:
        score += 10
    elif "AMENDED" in status:
        score += 5

    # Prefer mandatory/QCO standards for compliance contexts
    if any(kw in q for kw in SAFETY_KEYWORDS):
        if "mandatory" in (std.mandatory_status or "").lower():
            score += 20

    # Use seeded match_score as a baseline
    if std.match_score:
        score += std.match_score // 10

    return score


def rank_standards_for_query(query: str, standards: List[Standard]) -> List[Standard]:
    """Returns standards ranked by relevance to the query."""
    scored = [(std, _score_standard_for_query(query, std)) for std in standards]
    scored.sort(key=lambda x: x[1], reverse=True)
    return [std for std, score in scored if score > 0] or standards[:5]
