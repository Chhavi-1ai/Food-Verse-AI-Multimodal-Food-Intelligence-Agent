from typing import Dict, Any, Optional, List


# Calibrated nutritional data per 100g
NUTRITION_DATABASE: Dict[str, Dict[str, Any]] = {
    # Fruits
    "apple": {
        "category": "Fruit",
        "default_unit": "medium apple (approx 182g)",
        "default_grams": 182.0,
        "calories_per_100g": 52.0,
        "protein_g": 0.26,
        "carbs_g": 13.81,
        "fat_g": 0.17,
        "fiber_g": 2.4,
        "sugar_g": 10.39,
        "sodium_mg": 1.0,
        "allergens": [],
        "storage_tips": [
            "Store at room temperature for up to 7 days, or refrigerate at 1-4°C for up to 4 weeks.",
            "Keep separate from ethylene-sensitive produce like leafy greens."
        ]
    },
    "banana": {
        "category": "Fruit",
        "default_unit": "medium banana (approx 118g)",
        "default_grams": 118.0,
        "calories_per_100g": 89.0,
        "protein_g": 1.09,
        "carbs_g": 22.84,
        "fat_g": 0.33,
        "fiber_g": 2.6,
        "sugar_g": 12.23,
        "sodium_mg": 1.0,
        "allergens": [],
        "storage_tips": [
            "Store at room temperature away from direct sunlight.",
            "Do not refrigerate unripe bananas as cold halts the natural ripening process."
        ]
    },
    "orange": {
        "category": "Fruit",
        "default_unit": "medium orange (approx 131g)",
        "default_grams": 131.0,
        "calories_per_100g": 47.0,
        "protein_g": 0.94,
        "carbs_g": 11.75,
        "fat_g": 0.12,
        "fiber_g": 2.4,
        "sugar_g": 9.35,
        "sodium_mg": 0.0,
        "allergens": [],
        "storage_tips": [
            "Refrigerate in crisper drawer for up to 3 weeks.",
            "Keep dry to prevent mold spore germination."
        ]
    },
    "avocado": {
        "category": "Fruit",
        "default_unit": "1 medium avocado (approx 150g)",
        "default_grams": 150.0,
        "calories_per_100g": 160.0,
        "protein_g": 2.0,
        "carbs_g": 8.53,
        "fat_g": 14.66,
        "fiber_g": 6.7,
        "sugar_g": 0.66,
        "sodium_mg": 7.0,
        "allergens": [],
        "storage_tips": [
            "Ripen on counter, then refrigerate for 2-3 days once soft.",
            "Brush exposed flesh with lemon juice to retard enzymatic browning."
        ]
    },
    "strawberries": {
        "category": "Fruit",
        "default_unit": "1 cup whole berries (approx 144g)",
        "default_grams": 144.0,
        "calories_per_100g": 32.0,
        "protein_g": 0.67,
        "carbs_g": 7.68,
        "fat_g": 0.3,
        "fiber_g": 2.0,
        "sugar_g": 4.89,
        "sodium_mg": 1.0,
        "allergens": [],
        "storage_tips": [
            "Store in a ventilated container lined with paper towels in the fridge.",
            "Do not wash until immediately prior to consumption."
        ]
    },

    # Vegetables
    "tomato": {
        "category": "Vegetable",
        "default_unit": "1 medium tomato (approx 123g)",
        "default_grams": 123.0,
        "calories_per_100g": 18.0,
        "protein_g": 0.88,
        "carbs_g": 3.89,
        "fat_g": 0.2,
        "fiber_g": 1.2,
        "sugar_g": 2.63,
        "sodium_mg": 5.0,
        "allergens": [],
        "storage_tips": [
            "Store stem-side down at room temperature away from direct sunlight.",
            "Refrigeration damages flavor enzymes and texture; refrigerate only when fully ripe or cut."
        ]
    },
    "broccoli": {
        "category": "Vegetable",
        "default_unit": "1 cup florets (approx 91g)",
        "default_grams": 91.0,
        "calories_per_100g": 34.0,
        "protein_g": 2.82,
        "carbs_g": 6.64,
        "fat_g": 0.37,
        "fiber_g": 2.6,
        "sugar_g": 1.7,
        "sodium_mg": 33.0,
        "allergens": [],
        "storage_tips": [
            "Refrigerate unwashed in a loose perforated plastic bag in the crisper drawer.",
            "Use within 4 to 6 days."
        ]
    },
    "spinach": {
        "category": "Vegetable",
        "default_unit": "2 cups raw leaves (approx 60g)",
        "default_grams": 60.0,
        "calories_per_100g": 23.0,
        "protein_g": 2.86,
        "carbs_g": 3.63,
        "fat_g": 0.39,
        "fiber_g": 2.2,
        "sugar_g": 0.42,
        "sodium_mg": 79.0,
        "allergens": [],
        "storage_tips": [
            "Keep dry in an airtight container lined with paper towels.",
            "Store in coldest section of the refrigerator (1-3°C)."
        ]
    },
    "carrot": {
        "category": "Vegetable",
        "default_unit": "1 medium carrot (approx 61g)",
        "default_grams": 61.0,
        "calories_per_100g": 41.0,
        "protein_g": 0.93,
        "carbs_g": 9.58,
        "fat_g": 0.24,
        "fiber_g": 2.8,
        "sugar_g": 4.74,
        "sodium_mg": 69.0,
        "allergens": [],
        "storage_tips": [
            "Trim green tops immediately to prevent moisture loss.",
            "Refrigerate in a sealed container or crisper drawer for up to 3 weeks."
        ]
    },
    "bell pepper": {
        "category": "Vegetable",
        "default_unit": "1 medium pepper (approx 119g)",
        "default_grams": 119.0,
        "calories_per_100g": 31.0,
        "protein_g": 0.99,
        "carbs_g": 6.03,
        "fat_g": 0.3,
        "fiber_g": 2.1,
        "sugar_g": 4.2,
        "sodium_mg": 4.0,
        "allergens": [],
        "storage_tips": [
            "Store unwashed in vegetable crisper at 4-7°C.",
            "Keep dry to avoid soft spots."
        ]
    },

    # Prepared Dishes & Meals
    "grilled chicken salad": {
        "category": "Salad / Meal",
        "default_unit": "1 generous bowl (approx 350g)",
        "default_grams": 350.0,
        "calories_per_100g": 98.0,
        "protein_g": 11.5,
        "carbs_g": 4.2,
        "fat_g": 3.8,
        "fiber_g": 2.1,
        "sugar_g": 2.0,
        "sodium_mg": 280.0,
        "allergens": [],
        "storage_tips": [
            "Refrigerate within 2 hours of preparation.",
            "Keep dressing separate until serving to avoid wilting."
        ]
    },
    "chicken breast": {
        "category": "Protein",
        "default_unit": "1 cooked breast (approx 172g)",
        "default_grams": 172.0,
        "calories_per_100g": 165.0,
        "protein_g": 31.02,
        "carbs_g": 0.0,
        "fat_g": 3.57,
        "fiber_g": 0.0,
        "sugar_g": 0.0,
        "sodium_mg": 74.0,
        "allergens": [],
        "storage_tips": [
            "Refrigerate cooked chicken within 2 hours at <4°C.",
            "Consume within 3 to 4 days or freeze up to 4 months."
        ]
    },
    "salmon fillet": {
        "category": "Protein / Seafood",
        "default_unit": "1 cooked fillet (approx 180g)",
        "default_grams": 180.0,
        "calories_per_100g": 206.0,
        "protein_g": 22.1,
        "carbs_g": 0.0,
        "fat_g": 12.35,
        "fiber_g": 0.0,
        "sugar_g": 0.0,
        "sodium_mg": 61.0,
        "allergens": ["fish"],
        "storage_tips": [
            "Refrigerate cooked fish in an airtight glass container for 2 days maximum.",
            "Store raw fish on ice in refrigerator and cook within 24-48 hours."
        ]
    },
    "cooked brown rice": {
        "category": "Grains",
        "default_unit": "1 cup cooked (approx 195g)",
        "default_grams": 195.0,
        "calories_per_100g": 111.0,
        "protein_g": 2.58,
        "carbs_g": 22.96,
        "fat_g": 0.9,
        "fiber_g": 1.8,
        "sugar_g": 0.35,
        "sodium_mg": 5.0,
        "allergens": [],
        "storage_tips": [
            "Cool quickly in shallow dishes and refrigerate within 1 hour to prevent Bacillus cereus growth.",
            "Consume within 4 days."
        ]
    },
    "pasta with tomato sauce": {
        "category": "Prepared Dish",
        "default_unit": "1 bowl (approx 300g)",
        "default_grams": 300.0,
        "calories_per_100g": 131.0,
        "protein_g": 4.5,
        "carbs_g": 24.8,
        "fat_g": 1.8,
        "fiber_g": 2.2,
        "sugar_g": 3.5,
        "sodium_mg": 310.0,
        "allergens": ["gluten"],
        "storage_tips": [
            "Store in airtight container in refrigerator for 3-5 days.",
            "Reheat thoroughly to at least 74°C (165°F)."
        ]
    },
    "vegetable stir fry with tofu": {
        "category": "Prepared Dish / Vegan",
        "default_unit": "1 generous portion (approx 320g)",
        "default_grams": 320.0,
        "calories_per_100g": 85.0,
        "protein_g": 6.8,
        "carbs_g": 8.1,
        "fat_g": 3.5,
        "fiber_g": 2.7,
        "sugar_g": 3.1,
        "sodium_mg": 380.0,
        "allergens": ["soy"],
        "storage_tips": [
            "Keep chilled at 2-4°C in a covered container.",
            "Consume within 3 to 4 days."
        ]
    },
    "greek yogurt with berries": {
        "category": "Dairy / Breakfast",
        "default_unit": "1 cup serving (approx 200g)",
        "default_grams": 200.0,
        "calories_per_100g": 73.0,
        "protein_g": 9.0,
        "carbs_g": 6.5,
        "fat_g": 1.2,
        "fiber_g": 1.1,
        "sugar_g": 5.2,
        "sodium_mg": 36.0,
        "allergens": ["dairy"],
        "storage_tips": [
            "Keep refrigerated constantly at 1-4°C.",
            "Do not freeze; discard if liquid separation is accompanied by mold or foul odor."
        ]
    },
    "oatmeal with nuts and fruit": {
        "category": "Breakfast / Grains",
        "default_unit": "1 bowl prepared (approx 250g)",
        "default_grams": 250.0,
        "calories_per_100g": 115.0,
        "protein_g": 4.2,
        "carbs_g": 19.5,
        "fat_g": 2.8,
        "fiber_g": 3.4,
        "sugar_g": 4.5,
        "sodium_mg": 45.0,
        "allergens": ["tree nuts"],
        "storage_tips": [
            "Cooked oatmeal can be refrigerated for up to 5 days in a sealed container."
        ]
    },
    "egg omelet with vegetables": {
        "category": "Breakfast / Protein",
        "default_unit": "2-egg omelet (approx 160g)",
        "default_grams": 160.0,
        "calories_per_100g": 142.0,
        "protein_g": 10.4,
        "carbs_g": 2.3,
        "fat_g": 10.2,
        "fiber_g": 0.8,
        "sugar_g": 1.2,
        "sodium_mg": 210.0,
        "allergens": ["eggs"],
        "storage_tips": [
            "Best enjoyed fresh. If refrigerating leftovers, consume within 24-48 hours."
        ]
    },
    "avocado toast": {
        "category": "Breakfast / Snack",
        "default_unit": "1 slice loaded (approx 140g)",
        "default_grams": 140.0,
        "calories_per_100g": 195.0,
        "protein_g": 5.2,
        "carbs_g": 21.0,
        "fat_g": 10.5,
        "fiber_g": 4.8,
        "sugar_g": 2.0,
        "sodium_mg": 280.0,
        "allergens": ["gluten"],
        "storage_tips": [
            "Consume immediately for optimal bread texture and color."
        ]
    },
    "lentil soup": {
        "category": "Soup / Legumes",
        "default_unit": "1 bowl (approx 350g)",
        "default_grams": 350.0,
        "calories_per_100g": 68.0,
        "protein_g": 5.4,
        "carbs_g": 11.2,
        "fat_g": 0.5,
        "fiber_g": 4.1,
        "sugar_g": 1.8,
        "sodium_mg": 320.0,
        "allergens": [],
        "storage_tips": [
            "Refrigerate for up to 4 days or freeze for up to 3 months in airtight containers."
        ]
    },
    "whole wheat bread": {
        "category": "Bakery",
        "default_unit": "1 slice (approx 40g)",
        "default_grams": 40.0,
        "calories_per_100g": 247.0,
        "protein_g": 12.0,
        "carbs_g": 41.0,
        "fat_g": 3.4,
        "fiber_g": 7.0,
        "sugar_g": 5.5,
        "sodium_mg": 450.0,
        "allergens": ["gluten"],
        "storage_tips": [
            "Store in a cool dry pantry. Do not refrigerate as starch retrogrades faster in cold.",
            "Freeze slices for longer preservation."
        ]
    }
}


def find_nutrition_data(query: str) -> Dict[str, Any]:
    """Finds best matching food item in database with intelligent fallback."""
    cleaned = query.strip().lower()
    
    # Exact match
    if cleaned in NUTRITION_DATABASE:
        return {"matched_name": cleaned, **NUTRITION_DATABASE[cleaned]}
        
    # Substring search
    for name, data in NUTRITION_DATABASE.items():
        if name in cleaned or cleaned in name:
            return {"matched_name": name, **data}
            
    # Category fallback heuristic
    return {
        "matched_name": query.title(),
        "category": "Prepared Food",
        "default_unit": "1 standard serving (approx 150g)",
        "default_grams": 150.0,
        "calories_per_100g": 140.0,
        "protein_g": 6.0,
        "carbs_g": 18.0,
        "fat_g": 5.0,
        "fiber_g": 2.0,
        "sugar_g": 3.0,
        "sodium_mg": 240.0,
        "allergens": [],
        "storage_tips": [
            "Store covered in refrigerator at 1-4°C and consume within 2-3 days."
        ]
    }


def calculate_nutrition_for_grams(food_info: Dict[str, Any], grams: float) -> Dict[str, float]:
    """Scales nutrition values proportionally to the specified gram weight."""
    ratio = grams / 100.0
    return {
        "estimated_calories": round(food_info["calories_per_100g"] * ratio, 1),
        "protein_g": round(food_info["protein_g"] * ratio, 1),
        "carbs_g": round(food_info["carbs_g"] * ratio, 1),
        "fat_g": round(food_info["fat_g"] * ratio, 1),
        "fiber_g": round(food_info["fiber_g"] * ratio, 1),
        "sugar_g": round(food_info["sugar_g"] * ratio, 1),
        "sodium_mg": round(food_info["sodium_mg"] * ratio, 1),
    }

