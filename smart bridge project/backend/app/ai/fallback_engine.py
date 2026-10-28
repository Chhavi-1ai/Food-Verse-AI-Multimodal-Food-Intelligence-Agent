from pathlib import Path
from typing import Dict, Any, Optional, List
from backend.app.ai.cv_analyzer import CVAnalyzer
from backend.app.services.nutrition_db import find_nutrition_data, calculate_nutrition_for_grams


class FallbackEngine:
    """Computer vision heuristic classifier and rule-based inference engine."""

    @classmethod
    def analyze_food(cls, image_path: Path, filename_hint: Optional[str] = None) -> Dict[str, Any]:
        np_img, meta = CVAnalyzer.validate_and_load_image(image_path)
        metrics = CVAnalyzer.extract_visual_metrics(np_img)

        # Detect food type based on filename hint or CV metrics
        hint = (filename_hint or image_path.stem).lower()
        
        detected_food = "Grilled Chicken Salad"
        category = "Balanced Meal"
        
        # Check if hint matches known foods
        from backend.app.services.nutrition_db import NUTRITION_DATABASE
        matched_hint = False
        for key in NUTRITION_DATABASE.keys():
            if key in hint:
                detected_food = key.title()
                matched_hint = True
                break

        if not matched_hint:
            # Heuristic mapping based on OpenCV extracted color and edge metrics
            tone = metrics["dominant_tone"]
            spot = metrics["surface_spot_ratio"]
            if "green" in tone:
                detected_food = "Avocado" if spot < 0.04 else "Broccoli"
            elif "red" in tone:
                detected_food = "Tomato"
            elif "orange" in tone:
                detected_food = "Orange" if metrics["mean_brightness"] > 120 else "Carrot"
            elif "neutral" in tone:
                detected_food = "Cooked Brown Rice"
            else:
                detected_food = "Grilled Chicken Salad"

        # Nutrition lookup
        nutr_info = find_nutrition_data(detected_food)
        portion_grams = nutr_info["default_grams"]
        portion_unit = nutr_info["default_unit"]
        
        scaled_nutr = calculate_nutrition_for_grams(nutr_info, portion_grams)

        confidence = 0.86 if matched_hint else 0.74

        detected_items = [
            {
                "name": detected_food,
                "confidence": confidence,
                "portion_grams_estimated": portion_grams,
                "bounding_box": {"x": 0.15, "y": 0.12, "width": 0.70, "height": 0.76}
            }
        ]

        return {
            "food_name": detected_food,
            "original_detected_name": detected_food,
            "confidence": confidence,
            "portion_grams": portion_grams,
            "portion_unit": portion_unit,
            "portion_description": f"Standard portion ({portion_grams}g)",
            "estimated_calories": scaled_nutr["estimated_calories"],
            "protein_g": scaled_nutr["protein_g"],
            "carbs_g": scaled_nutr["carbs_g"],
            "fat_g": scaled_nutr["fat_g"],
            "fiber_g": scaled_nutr["fiber_g"],
            "sugar_g": scaled_nutr["sugar_g"],
            "sodium_mg": scaled_nutr["sodium_mg"],
            "is_user_corrected": False,
            "ai_provider_used": "opencv-cv-fallback",
            "is_simulated_or_estimated": True,
            "disclaimer_note": (
                "Notice: Nutrition and portion sizes are calculated approximations derived from visual analysis and standard USDA food composition references. They do not constitute certified nutritional or laboratory measurements."
            ),
            "detected_items": detected_items,
            "cv_metrics": metrics
        }

    @classmethod
    def analyze_freshness(cls, image_path: Path, food_hint: Optional[str] = None) -> Dict[str, Any]:
        np_img, meta = CVAnalyzer.validate_and_load_image(image_path)
        metrics = CVAnalyzer.extract_visual_metrics(np_img)

        # Classification based on real CV metrics
        brightness = metrics["mean_brightness"]
        sharpness = metrics["sharpness_laplacian"]
        spot_ratio = metrics["surface_spot_ratio"]
        contrast = metrics["contrast"]

        hint = (food_hint or image_path.stem).lower()
        nutr = find_nutrition_data(hint)
        item_name = nutr["matched_name"].title()
        category = nutr["category"]
        storage_tips = nutr.get("storage_tips", [
            "Store in a clean, temperature-controlled environment (<4°C for perishables).",
            "Keep dry and inspect periodically for changes in texture or odor."
        ])

        # Check for unreadable / bad lighting
        if brightness < 20 or sharpness < 10:
            visual_status = "Unable to determine"
            confidence = 0.45
            explanation = "Image lighting is too low or focus is too blurry to extract reliable visual surface indicators."
            characteristics = ["Insufficient lighting / underexposure", "Low contrast surface details"]
        elif spot_ratio >= 0.08 or (spot_ratio >= 0.05 and contrast > 60):
            visual_status = "Visible spoilage indicators"
            confidence = 0.88
            explanation = (
                f"Elevated visual defect ratio detected ({round(spot_ratio * 100, 1)}% surface irregularity). "
                "Observable patches indicate significant surface discoloration, bruising, or fungal/mold-like patterning."
            )
            characteristics = [
                "High surface blemish density",
                "Color discontinuity indicative of tissue breakdown",
                "Localized dark or uneven spotting"
            ]
        elif spot_ratio >= 0.035:
            visual_status = "Possible quality deterioration"
            confidence = 0.79
            explanation = (
                f"Minor visual surface irregularities observed ({round(spot_ratio * 100, 1)}% spot ratio). "
                "The item shows preliminary signs of skin wrinkling, slight browning, or dehydration."
            )
            characteristics = [
                "Moderate surface discoloration",
                "Early texture softening or oxidation patterns",
                "Minor surface blemishes"
            ]
        else:
            visual_status = "Appears fresh"
            confidence = 0.91
            explanation = (
                f"Uniform color distribution and smooth surface texture detected ({round(spot_ratio * 100, 1)}% blemish ratio). "
                "Visible appearance shows vibrant coloration and intact surface boundaries."
            )
            characteristics = [
                "Consistent, vibrant pigmentation",
                "Smooth, intact outer skin/surface",
                "Negligible dark spot clusters (<3%)"
            ]

        safety_disclaimer = (
            "CRITICAL SAFETY WARNING: Visual freshness assessment evaluates visible physical appearance only. "
            "An image CANNOT establish microbiological safety or detect harmful bacterial contaminants "
            "(e.g., Salmonella, Listeria, E. coli, norovirus, or invisible toxins). "
            "Never consume food that has an abnormal odor, slimy texture, unusual taste, or improper temperature history, "
            "even if it visually appears fresh."
        )

        return {
            "food_category": category,
            "item_name": item_name,
            "visual_status": visual_status,
            "confidence": confidence,
            "discoloration_score": min(1.0, round(spot_ratio * 5, 2)),
            "surface_defect_score": min(1.0, round(spot_ratio * 6, 2)),
            "detected_visual_characteristics": characteristics,
            "explanation": explanation,
            "storage_recommendations": storage_tips,
            "safety_disclaimer": safety_disclaimer,
            "ai_provider_used": "opencv-cv-fallback",
            "cv_metrics": metrics
        }

    @classmethod
    def analyze_hygiene(cls, image_path: Path) -> Dict[str, Any]:
        np_img, meta = CVAnalyzer.validate_and_load_image(image_path)
        metrics = CVAnalyzer.extract_visual_metrics(np_img)

        edge_density = metrics["edge_density"]
        spot_ratio = metrics["surface_spot_ratio"]
        brightness = metrics["mean_brightness"]

        observations: List[str] = []
        unresolved: List[str] = []
        corrective_actions: List[str] = []

        # Real CV based interpretation:
        if edge_density > 0.09:
            observations.append(f"High visual clutter detected across preparation zone (edge complexity: {round(edge_density, 3)}).")
            unresolved.append("Disorganized prep station with miscellaneous objects and utensil clusters.")
            corrective_actions.append("Clear prep surfaces; implement 'Clean-as-you-go' policy and return items to designated racks.")
        else:
            observations.append("Surface organization meets general neatness benchmarks with low perimeter clutter.")

        if spot_ratio > 0.04:
            observations.append(f"Observable surface markings or potential liquid/food residue on workstation (spot index: {round(spot_ratio, 3)}).")
            unresolved.append("Possible uncleaned spills or residue on stainless counter.")
            corrective_actions.append("Sanitize surface using approved food-grade disinfectant; dry with single-use sanitary towel.")
        else:
            observations.append("Prep surfaces appear clear of noticeable dark residue spots.")

        if brightness < 60:
            observations.append("Lighting in preparation zone is substandard (<60 mean lux approximation).")
            unresolved.append("Inadequate illumination for safe food preparation and defect visibility.")
            corrective_actions.append("Upgrade station lighting to meet minimum 50 foot-candles (540 lux) commercial kitchen standards.")
        else:
            observations.append("Adequate ambient illumination visible in preparation zone.")

        # Compute calculated score
        deductions = len(unresolved) * 15
        overall_score = max(40.0, min(98.0, 100.0 - deductions))
        
        if overall_score >= 85:
            status = "Passed"
        elif overall_score >= 70:
            status = "Needs Attention"
        else:
            status = "Critical Action Required"

        if not corrective_actions:
            corrective_actions.append("Maintain routine hourly sanitation sweeps and temperature log verifications.")

        safety_disclaimer = (
            "LEGAL & SAFETY NOTICE: Automated computer vision inspects only visible surface clutter and optical cleanliness indicators. "
            "It cannot detect viral or bacterial pathogens, confirm chemical sanitizer concentration (ppm), "
            "verify internal cook temperatures, or replace mandatory local Health Department inspections."
        )

        return {
            "facility_name": "Main Kitchen Area",
            "inspector_name": "FoodVerse CV Visual Inspection Engine",
            "inspection_type": "Automated CV Scan",
            "overall_score": overall_score,
            "status": status,
            "detected_observations": observations,
            "unresolved_observations": unresolved,
            "corrective_actions": corrective_actions,
            "safety_disclaimer": safety_disclaimer,
            "ai_provider_used": "opencv-cv-fallback",
            "cv_metrics": metrics
        }

