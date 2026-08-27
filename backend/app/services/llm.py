"""
NormAI LLM Service.
Connects to Google Gemini API (using google-genai) with offline/mock fallback.
"""
import os
import json
import logging
from app.config import get_settings

logger = logging.getLogger("normai.llm")
settings = get_settings()


class LLMService:
    @staticmethod
    def generate(prompt: str, system_instruction: str = None) -> str:
        """Generate response text from Gemini or mock."""
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "REPLACE_WITH_YOUR_GEMINI_API_KEY":
            logger.info("Using Offline/Mock LLM generation (No API key found)")
            return LLMService._mock_generate(prompt)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            config = types.GenerateContentConfig()
            if system_instruction:
                config.system_instruction = system_instruction

            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            logger.error(f"Gemini API error: {e}. Falling back to mock generation.")
            return LLMService._mock_generate(prompt)

    @staticmethod
    def extract_structured(prompt: str, schema: dict) -> dict:
        """Extract structured JSON from text based on a schema."""
        api_key = settings.GEMINI_API_KEY
        if not api_key or api_key == "REPLACE_WITH_YOUR_GEMINI_API_KEY":
            logger.info("Using Offline/Mock structured extraction (No API key found)")
            return LLMService._mock_extract(prompt, schema)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=api_key)
            config = types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=schema
            )
            response = client.models.generate_content(
                model=settings.GEMINI_MODEL,
                contents=prompt,
                config=config
            )
            return json.loads(response.text)
        except Exception as e:
            logger.error(f"Gemini Structured Extraction error: {e}. Falling back to mock extraction.")
            return LLMService._mock_extract(prompt, schema)

    @staticmethod
    def _mock_generate(prompt: str) -> str:
        # Standard E2E demo responses based on common product keywords
        p_lower = prompt.lower()
        if "mixer" in p_lower or "grinder" in p_lower or "kitchen" in p_lower:
            return (
                "Based on the characteristics provided (750W, 230V AC, 50Hz, domestic use, food preparation), "
                "the primary applicable Indian Standard is **IS 302-2-14:2009** ('Particular Requirements for Kitchen Machines'). "
                "This standard is MANDATORY under the Electrical Appliances QCO, 2023. Key clauses that apply include "
                "Clause 7.1 (Marking), Clause 13.2 (Leakage Current), and Clause 19.11 (Motor abnormal lock-rotor test)."
            )
        return (
            "We have analyzed your product query. The applicable Indian Standard needs to be mapped to a valid IS code. "
            "Please upload your product datasheet or specification sheet for a comprehensive clause analysis."
        )

    @staticmethod
    def _mock_extract(prompt: str, schema: dict) -> dict:
        p_lower = prompt.lower()
        # Mock structured output for mixer grinder E2E flow
        if "mixer" in p_lower or "grinder" in p_lower:
            return {
                "product_name": "750W Mixer Grinder",
                "category": "Household Electrical Appliances",
                "voltage": "230V AC",
                "power": "750W",
                "frequency": "50Hz",
                "insulation_class": "Class I",
                "intended_use": "domestic household food preparation"
            }
        return {
            "product_name": "Generic Product",
            "category": "General",
            "voltage": "Unknown",
            "power": "Unknown",
            "frequency": "Unknown",
            "insulation_class": "Unknown",
            "intended_use": "Unknown"
        }
