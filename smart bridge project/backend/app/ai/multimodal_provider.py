import base64
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional
import httpx
from backend.app.core.config import settings
from backend.app.ai.base import BaseVisionProvider
from backend.app.ai.fallback_engine import FallbackEngine
from backend.app.services.nutrition_db import find_nutrition_data, calculate_nutrition_for_grams

logger = logging.getLogger(__name__)


class MultimodalVisionProvider(BaseVisionProvider):
    """Integrates with Google Gemini Vision API with robust fallback to OpenCV & heuristic engine."""

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.AI_MODEL_NAME

    def _encode_image(self, image_path: Path) -> str:
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode("utf-8")

    async def _call_gemini_vision(self, prompt: str, image_path: Path) -> Optional[Dict[str, Any]]:
        """Makes a direct REST call to Gemini Vision endpoint with structured JSON expectations."""
        if not settings.has_ai_credentials:
            return None

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model_name}:generateContent?key={self.api_key}"
        
        # Determine mime type
        ext = image_path.suffix.lower()
        mime_type = "image/jpeg"
        if ext == ".png":
            mime_type = "image/png"
        elif ext == ".webp":
            mime_type = "image/webp"

        b64_data = self._encode_image(image_path)

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": b64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.2
            }
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, json=payload)
                if response.status_code == 200:
                    data = response.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return json.loads(text_content)
                else:
                    logger.warning(f"Gemini API returned status {response.status_code}: {response.text}")
        except Exception as e:
            logger.error(f"Error querying Gemini Vision API: {e}")

        return None

    async def analyze_food(self, image_path: Path, filename_hint: Optional[str] = None) -> Dict[str, Any]:
        """Analyzes food using Gemini vision when available, or OpenCV fallback."""
        if settings.has_ai_credentials:
            prompt = """
            Analyze this food image. Provide response in exact JSON:
            {
              "food_name": "Name of main food dish or item",
              "confidence": 0.95,
              "portion_grams": 200.0,
              "portion_unit": "grams",
              "portion_description": "1 medium bowl",
              "estimated_calories": 320.0,
              "protein_g": 18.0,
              "carbs_g": 35.0,
              "fat_g": 12.0,
              "fiber_g": 4.0,
              "sugar_g": 5.0,
              "sodium_mg": 420.0,
              "detected_items": [
                 {"name": "Food item", "confidence": 0.95, "portion_grams_estimated": 200.0}
              ]
            }
            Do not fabricate laboratory certainty; provide reasonable estimates.
            """
            gemini_result = await self._call_gemini_vision(prompt, image_path)
            if gemini_result and "food_name" in gemini_result:
                gemini_result["ai_provider_used"] = "gemini-multimodal"
                gemini_result["is_simulated_or_estimated"] = False
                gemini_result["is_user_corrected"] = False
                gemini_result["disclaimer_note"] = (
                    "Analyzed via Gemini Multimodal AI. Visual nutrition and portion sizes are computational estimates, "
                    "not laboratory chemical measurements."
                )
                return gemini_result

        # Fallback to OpenCV CV Engine
        return FallbackEngine.analyze_food(image_path, filename_hint)

    async def analyze_freshness(self, image_path: Path, food_hint: Optional[str] = None) -> Dict[str, Any]:
        """Analyzes freshness using Gemini vision when available, or OpenCV fallback."""
        if settings.has_ai_credentials:
            prompt = """
            Examine this produce/food image for visual signs of freshness or quality deterioration.
            Provide response in exact JSON:
            {
              "food_category": "Fruit / Vegetable / Dairy / etc.",
              "item_name": "Specific item name",
              "visual_status": "One of: 'Appears fresh', 'Possible quality deterioration', 'Visible spoilage indicators', 'Unable to determine'",
              "confidence": 0.90,
              "discoloration_score": 0.1,
              "surface_defect_score": 0.1,
              "detected_visual_characteristics": ["Characteristic 1", "Characteristic 2"],
              "explanation": "Detailed explanation of visual observations",
              "storage_recommendations": ["Storage tip 1", "Storage tip 2"]
            }
            Important: clearly distinguish visual quality from microbiological safety.
            """
            gemini_result = await self._call_gemini_vision(prompt, image_path)
            if gemini_result and "visual_status" in gemini_result:
                gemini_result["ai_provider_used"] = "gemini-multimodal"
                gemini_result["safety_disclaimer"] = (
                    "SAFETY DISCLAIMER: AI visual evaluation is strictly physical appearance analysis. "
                    "Images CANNOT verify microbiological safety or test for pathogenic bacterial colonization. "
                    "Discard food exhibiting spoilage odors, unusual texture, slime, or improper storage temperatures."
                )
                return gemini_result

        # Fallback
        return FallbackEngine.analyze_freshness(image_path, food_hint)

    async def analyze_hygiene(self, image_path: Path) -> Dict[str, Any]:
        """Analyzes hygiene using Gemini vision when available, or OpenCV fallback."""
        if settings.has_ai_credentials:
            prompt = """
            Examine this kitchen / food prep workstation image for visible sanitation indicators.
            Provide response in exact JSON:
            {
              "facility_name": "Kitchen Area",
              "inspector_name": "Gemini AI Vision Auditor",
              "inspection_type": "Automated CV Scan",
              "overall_score": 88.0,
              "status": "One of: 'Passed', 'Needs Attention', 'Critical Action Required'",
              "detected_observations": ["Observation 1", "Observation 2"],
              "unresolved_observations": ["Issue 1 if any"],
              "corrective_actions": ["Action 1", "Action 2"]
            }
            Do not claim to detect microscopic bacteria or certify regulatory health compliance.
            """
            gemini_result = await self._call_gemini_vision(prompt, image_path)
            if gemini_result and "status" in gemini_result:
                gemini_result["ai_provider_used"] = "gemini-multimodal"
                gemini_result["safety_disclaimer"] = (
                    "AUDIT DISCLAIMER: Visual observation reports visible physical setup and clutter indicators only. "
                    "It cannot confirm microbiological sterility or substitute for regulatory sanitary enforcement."
                )
                return gemini_result

        # Fallback
        return FallbackEngine.analyze_hygiene(image_path)


# Singleton instance
ai_vision_provider = MultimodalVisionProvider()

