"""
NormAI LangChain Orchestration Layer
=====================================
Replaces direct LLMService.generate() calls with a genuine LangChain chain
that orchestrates: product classification → standards retrieval → compliance
analysis → cited response composition.

Graceful degradation: if LangChain or the Gemini API key is unavailable,
falls back to the existing LLMService mock pipeline so the server never crashes.
"""
import logging
from typing import Optional
from app.config import get_settings

logger = logging.getLogger("normai.chain")
settings = get_settings()

# ---------------------------------------------------------------------------
# LangChain availability check
# ---------------------------------------------------------------------------
LANGCHAIN_AVAILABLE = False
try:
    from langchain_google_genai import ChatGoogleGenerativeAI
    from langchain_core.prompts import ChatPromptTemplate
    from langchain_core.output_parsers import StrOutputParser
    LANGCHAIN_AVAILABLE = True
    logger.info("LangChain + langchain-google-genai available.")
except ImportError:
    logger.warning("LangChain not installed. Falling back to direct LLM calls.")


# ---------------------------------------------------------------------------
# Prompt Templates
# ---------------------------------------------------------------------------

PRODUCT_CLASSIFIER_PROMPT = """You are a BIS (Bureau of Indian Standards) product classification expert.
Given the following product query, extract structured product attributes.

Product Query: {query}

Return a JSON object with these fields:
- product_name: string
- category: one of ["Household Electrical Appliances", "Industrial Equipment", "Electronics", "Food Products", "Construction Materials", "Other"]
- voltage: string (e.g. "230V AC")
- power: string (e.g. "750W")
- frequency: string (e.g. "50Hz")
- insulation_class: string (e.g. "Class I")
- intended_use: string
- is_domestic: boolean

Return ONLY valid JSON, no markdown fences."""

STANDARDS_ANALYSIS_PROMPT = """You are NormAI, an AI certification co-pilot for the Bureau of Indian Standards.

Product: {product_info}
Matched Standard: {standard_code} — {standard_title}
Match Score: {match_score}%

Relevant Clause Evidence (retrieved via semantic search from the standard):
{clause_evidence}

Based on the above, provide a clear, technically precise answer explaining:
1. WHY this standard applies to this specific product
2. Which key clauses the manufacturer must satisfy
3. What certification pathway (Scheme I ISI Mark, CRS, etc.) is required
4. Any critical compliance gaps to address first

Keep your answer under 200 words. Cite specific clause numbers inline (e.g. "per Clause 7.1").
Do NOT use markdown formatting. Write plain text paragraphs."""

COMPLIANCE_ANALYSIS_PROMPT = """You are a BIS compliance auditor AI assistant.

Standard: {standard_code}
Product Evidence Fields:
{evidence_fields}

For each extracted field, evaluate whether it satisfies the requirement from the standard.
If a required parameter is missing or ambiguous, flag it as a gap.

Respond with a brief technical assessment (max 100 words) of the product's compliance readiness."""


class NormAIChain:
    """
    LangChain-based orchestration for NormAI's core AI pipeline.

    Methods:
        classify_product(query) -> dict
        analyze_standards(query, standard, clauses) -> str
        analyze_compliance(standard_code, fields) -> str
    """

    _llm = None

    @classmethod
    def _get_llm(cls):
        """Lazy-init the LangChain LLM. Returns None if unavailable."""
        if cls._llm is not None:
            return cls._llm

        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "REPLACE_WITH_YOUR_GEMINI_API_KEY":
            logger.info("No Gemini API key — LangChain LLM unavailable.")
            return None

        if not LANGCHAIN_AVAILABLE:
            return None

        try:
            cls._llm = ChatGoogleGenerativeAI(
                model=settings.GEMINI_MODEL,
                google_api_key=api_key,
                temperature=0.2,
                max_output_tokens=1024,
            )
            logger.info(f"LangChain LLM initialized: {settings.GEMINI_MODEL}")
            return cls._llm
        except Exception as e:
            logger.error(f"Failed to initialize LangChain LLM: {e}")
            return None

    @classmethod
    def classify_product(cls, query: str) -> Optional[dict]:
        """
        Step 1: Parse a natural-language product query into structured attributes
        using a LangChain prompt chain.

        Returns dict of product attributes, or None on failure.
        """
        llm = cls._get_llm()
        if not llm:
            return None

        try:
            prompt = ChatPromptTemplate.from_template(PRODUCT_CLASSIFIER_PROMPT)
            chain = prompt | llm | StrOutputParser()
            result = chain.invoke({"query": query})

            import json
            # Strip markdown fences if present
            clean = result.strip()
            if clean.startswith("```"):
                clean = clean.split("\n", 1)[1] if "\n" in clean else clean[3:]
            if clean.endswith("```"):
                clean = clean[:-3]

            return json.loads(clean.strip())
        except Exception as e:
            logger.error(f"Product classification chain error: {e}")
            return None

    @classmethod
    def analyze_standards(
        cls,
        query: str,
        standard_code: str,
        standard_title: str,
        match_score: int,
        clause_evidence: str,
    ) -> Optional[str]:
        """
        Step 2+3: Given matched standard and semantically retrieved clauses,
        produce a comprehensive standards analysis answer.

        Returns the answer text, or None on failure.
        """
        llm = cls._get_llm()
        if not llm:
            return None

        try:
            prompt = ChatPromptTemplate.from_template(STANDARDS_ANALYSIS_PROMPT)
            chain = prompt | llm | StrOutputParser()
            result = chain.invoke({
                "product_info": query,
                "standard_code": standard_code,
                "standard_title": standard_title,
                "match_score": match_score,
                "clause_evidence": clause_evidence,
            })
            return result.strip()
        except Exception as e:
            logger.error(f"Standards analysis chain error: {e}")
            return None

    @classmethod
    def analyze_compliance(
        cls,
        standard_code: str,
        evidence_fields: str,
    ) -> Optional[str]:
        """
        Step 4: Evaluate extracted evidence fields against standard requirements.

        Returns a compliance assessment summary, or None on failure.
        """
        llm = cls._get_llm()
        if not llm:
            return None

        try:
            prompt = ChatPromptTemplate.from_template(COMPLIANCE_ANALYSIS_PROMPT)
            chain = prompt | llm | StrOutputParser()
            result = chain.invoke({
                "standard_code": standard_code,
                "evidence_fields": evidence_fields,
            })
            return result.strip()
        except Exception as e:
            logger.error(f"Compliance analysis chain error: {e}")
            return None

    @classmethod
    def is_available(cls) -> bool:
        """Check whether LangChain pipeline is operational."""
        return cls._get_llm() is not None
