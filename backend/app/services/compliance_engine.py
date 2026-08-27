"""
NormAI Dynamic Compliance Engine
==================================
Replaces hardcoded compliance findings with pattern-based dynamic checking.

How it works:
1. Load compliance_risk_patterns.json at startup (cached after first load).
2. For each pattern matching the requested standard_code:
   a. Check whether any evidence keyword appears in the extracted document fields.
   b. If NO keyword is found → generate a CRITICAL/ATTENTION finding.
   c. If keyword IS found → generate a PASSED finding with the matched field value
      as the observed text.
3. Call LLM (optional, degrades gracefully) to produce a context-aware
   'observed' sentence using the actual document text snippet.

Proving this is real:
- Upload a document that only mentions "750W" and "motor" → P002 (Clause 7.1)
  will fire CRITICAL because "50hz" and "nameplate" are absent.
- Upload a complete spec sheet with all required fields → most patterns will PASS.
"""
import json
import logging
import os
from typing import List, Optional
from datetime import datetime

logger = logging.getLogger("normai.compliance_engine")

# Cached patterns – loaded once on first use
_PATTERNS: Optional[list] = None


def _load_patterns() -> list:
    global _PATTERNS
    if _PATTERNS is not None:
        return _PATTERNS

    data_dir = os.path.join(os.path.dirname(__file__), "..", "data")
    path = os.path.join(data_dir, "compliance_risk_patterns.json")
    path = os.path.normpath(path)

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        _PATTERNS = data.get("patterns", [])
        logger.info(f"Loaded {len(_PATTERNS)} compliance risk patterns from {path}")
    except Exception as e:
        logger.error(f"Failed to load compliance risk patterns: {e}")
        _PATTERNS = []

    return _PATTERNS


def _evidence_check(pattern: dict, field_texts: List[str]) -> tuple[bool, str]:
    """
    Returns (found: bool, matched_snippet: str).

    found = True if ANY evidence keyword appears in ANY extracted field text.
    matched_snippet = the field value that contained the keyword.
    """
    keywords = [kw.lower() for kw in pattern.get("evidence_keywords", [])]
    combined = " ".join(t.lower() for t in field_texts)

    for kw in keywords:
        if kw in combined:
            # Find the specific field that contained the match
            for field_text in field_texts:
                if kw in field_text.lower():
                    return True, field_text.strip()
            return True, ""

    return False, ""


def _llm_observed_sentence(
    pattern: dict,
    found: bool,
    matched_snippet: str,
    all_field_text: str,
) -> str:
    """
    Use LLM to generate a specific 'observed' sentence for this finding.
    Falls back to template string if LLM is unavailable.
    """
    try:
        from app.services.llm import LLMService

        if found:
            prompt = (
                f"A product specification document was reviewed for compliance with {pattern['standard_code']} {pattern['clause_number']}.\n"
                f"Requirement: {pattern['requirement_text']}\n"
                f"The following evidence WAS found in the document: \"{matched_snippet}\"\n"
                f"Write one factual, technical sentence (max 40 words) describing what the document shows that satisfies this requirement. "
                f"Start with 'Submitted specification confirms...' or 'Document demonstrates...'"
            )
        else:
            prompt = (
                f"A product specification document was reviewed for compliance with {pattern['standard_code']} {pattern['clause_number']}.\n"
                f"Requirement: {pattern['requirement_text']}\n"
                f"Document content summary: \"{all_field_text[:400]}\"\n"
                f"None of these evidence keywords were found: {pattern['evidence_keywords'][:4]}\n"
                f"Write one factual, technical sentence (max 40 words) describing what is MISSING from the document. "
                f"Start with 'Submitted documentation does not...' or 'No evidence of...'"
            )

        result = LLMService.generate(prompt)
        # Truncate if excessively long
        sentences = result.strip().split(".")
        return sentences[0].strip() + "." if sentences else result[:200]

    except Exception as exc:
        logger.debug(f"LLM observed sentence failed ({exc}), using template.")
        if found:
            return f"Submitted documentation confirms evidence for {pattern['clause_number']}: '{matched_snippet[:120]}'"
        else:
            return pattern["gap_description"]


class DynamicComplianceChecker:
    """
    Entry point for the dynamic compliance engine.

    Usage:
        from app.services.compliance_engine import DynamicComplianceChecker
        findings = DynamicComplianceChecker.check(
            standard_code="IS 302-2-14",
            extracted_fields=doc_fields,   # list of ExtractedField ORM objects
            db=db
        )
    """

    @staticmethod
    def check(
        standard_code: str,
        extracted_fields: list,
        db,
        use_llm_observed: bool = True,
    ) -> list:
        """
        Run all applicable patterns for the given standard_code against
        the evidence in extracted_fields.

        Returns a list of dicts ready to be mapped to ComplianceFinding ORM objects.
        """
        from app.models import FindingSeverity, FindingStatus

        patterns = _load_patterns()

        # Filter patterns to those matching this standard_code OR parent standards
        # (IS 302-2-14 also implies IS 302-1 checks)
        related_standards = {standard_code}
        if "302-2-14" in standard_code:
            related_standards.update({"IS 302-1", "IS 302-2-14", "IS 694", "IS 1293"})
        elif "302-1" in standard_code:
            related_standards.update({"IS 302-1", "IS 694"})

        applicable = [p for p in patterns if p["standard_code"] in related_standards]

        if not applicable:
            # Fallback: use all patterns for any standard
            applicable = patterns
            logger.warning(f"No patterns matched '{standard_code}'. Using all {len(applicable)} patterns.")

        # Build flat list of all field texts for evidence search
        field_texts = []
        for f in extracted_fields:
            if f.field_value:
                field_texts.append(f.field_value)
            if f.source_text:
                field_texts.append(f.source_text)

        all_field_text = " ".join(field_texts)

        findings = []
        for pattern in applicable:
            found, matched_snippet = _evidence_check(pattern, field_texts)

            # Determine severity from pattern
            raw_severity = pattern["severity"].upper()
            if found:
                severity = FindingSeverity.PASSED
                finding_status = FindingStatus.SATISFIED
            elif raw_severity == "CRITICAL":
                severity = FindingSeverity.CRITICAL
                finding_status = FindingStatus.POTENTIALLY_MISSING
            elif raw_severity == "ATTENTION":
                severity = FindingSeverity.ATTENTION
                finding_status = FindingStatus.MANUAL_REVIEW_REQUIRED
            else:
                severity = FindingSeverity.PASSED
                finding_status = FindingStatus.SATISFIED

            # Generate observed sentence
            if use_llm_observed:
                observed = _llm_observed_sentence(pattern, found, matched_snippet, all_field_text)
            else:
                observed = (
                    f"Evidence found: '{matched_snippet[:150]}'" if found
                    else pattern["gap_description"]
                )

            findings.append({
                "pattern_id": pattern["id"],
                "title": _finding_title(pattern, found),
                "section": pattern["section"],
                "severity": severity,
                "finding_status": finding_status,
                "requirement": pattern["requirement_text"],
                "observed": observed,
                "recommended_action": pattern["recommended_action"],
                "clause_citation": f"{pattern['standard_code']} · {pattern['clause_number']}",
                "standard_code": pattern["standard_code"],
                "clause_number": pattern["clause_number"],
                "confidence": 0.92 if found else (0.85 if not all_field_text else 0.78),
            })

        return findings


def _finding_title(pattern: dict, found: bool) -> str:
    """Generate a human-readable finding title."""
    clause = pattern["clause_number"]
    section = pattern["section"]
    std = pattern["standard_code"]

    if found:
        # Reword as a PASS title
        brief = pattern["requirement_text"].split(".")[0][:80]
        return f"{brief} — Verified ({std} {clause})"
    else:
        # Reword as a gap title — use first 80 chars of requirement
        brief = pattern["gap_description"].split(".")[0][:80]
        return brief
