# Food Verse AI – REST API Reference

The backend exposes a modern, fully typed REST API with automatic OpenAPI documentation available at `http://localhost:8000/docs`.

---

## 1. System Endpoints

### `GET /api/health`
Returns system diagnostics, database connectivity, active AI engine, and feature list.

### `GET /api/dashboard-summary`
Aggregates user metrics, today's calories, upcoming planned meals, recent analyses, and high-level KPIs.

### `POST /api/seed-sample-data`
Refreshes and seeds production-grade sample recipes, food analyses, freshness assessments, and hygiene audits.

---

## 2. Food Recognition & Nutrition (`/api/food`)

### `POST /api/food/analyze`
- **Content-Type**: `multipart/form-data`
- **Body**: `file` (JPEG, PNG, WebP image up to 10MB), optional `food_hint` (string)
- **Response**:
  ```json
  {
    "food_name": "Grilled Chicken Salad",
    "confidence": 0.92,
    "portion_grams": 350.0,
    "portion_unit": "grams",
    "portion_description": "1 large bowl (350g)",
    "estimated_calories": 343.0,
    "protein_g": 40.2,
    "carbs_g": 14.7,
    "fat_g": 13.3,
    "fiber_g": 7.3,
    "sugar_g": 7.0,
    "sodium_mg": 980.0,
    "ai_provider_used": "opencv-cv-fallback",
    "disclaimer_note": "Calculated approximation based on standard composition tables."
  }
  ```

### `POST /api/food/recalculate`
- **Body**: `{"food_name": "apple", "portion_grams": 250.0, "portion_unit": "grams"}`
- Scales nutrition proportionally when user modifies grams or food name.

### `POST /api/food/save`
Persists analysis to database and creates a daily nutrition consumption record.

### `GET /api/food/history?limit=20`
Retrieves paginated historical food analyses.

### `GET /api/food/daily-summary?date_str=YYYY-MM-DD`
Computes daily aggregated calorie, macro, and sodium totals.

---

## 3. Freshness & Spoilage Detection (`/api/freshness`)

### `POST /api/freshness/analyze`
- **Content-Type**: `multipart/form-data`
- **Body**: `file`, optional `food_hint`
- **Response**:
  ```json
  {
    "food_category": "Fruit",
    "item_name": "Fresh Honeycrisp Apple",
    "visual_status": "Appears fresh",
    "confidence": 0.94,
    "discoloration_score": 0.04,
    "surface_defect_score": 0.03,
    "detected_visual_characteristics": ["Uniform red-yellow pigmentation", "Smooth skin"],
    "explanation": "Tight surface tension with negligible defects detected.",
    "storage_recommendations": ["Refrigerate at 1-3°C", "Keep separate from ethylene-sensitive greens"],
    "safety_disclaimer": "CRITICAL SAFETY WARNING: Visual appearance does not verify microbiological safety."
  }
  ```

---

## 4. Restaurant Hygiene Monitoring (`/api/hygiene`)

### `POST /api/hygiene/analyze`
Scans kitchen or workstation photo for edge clutter and surface residue.

### `POST /api/hygiene/inspections`
Creates inspection record with 8-point checklist:
- `prep_clean`, `storage_org`, `raw_rte_sep`, `waste_accum`, `handwash`, `clean_schedule`, `temp_logs`, `pest_control`

### `GET /api/hygiene/inspections`
Retrieves past inspection audits with compliance scores and statuses.

### `GET /api/hygiene/summary`
Calculates overall compliance rate, average score, and open corrective actions.

---

## 5. Smart Cooking Assistant & Recipes (`/api/recipes`)

### `GET /api/recipes`
Filters by query, cuisine, meal_type, difficulty, max_time, or dietary_tag.

### `POST /api/recipes/recommend`
- **Body**: `{"available_ingredients": ["chicken", "garlic", "lemon"]}`
- Returns sorted recipes with match percentage, matching ingredients, and missing ingredients.

### `GET /api/recipes/{id}?servings=N`
Scales recipe ingredients and calories proportionally to N servings.

### `POST /api/recipes/favorites/{id}`
Toggles favorite bookmark for the given recipe.

---

## 6. Personalized Meal Planner & Shopping (`/api/meal-plans`, `/api/shopping-list`)

### `POST /api/meal-plans/generate`
Generates daily or weekly plan with calorie targeting and strict allergen exclusions.

### `PUT /api/meal-plans/replace-meal`
Swaps individual planned meals for alternative recipes.

### `POST /api/shopping-list/generate`
Automatically aggregates ingredients from selected meal plan into classified grocery items.

