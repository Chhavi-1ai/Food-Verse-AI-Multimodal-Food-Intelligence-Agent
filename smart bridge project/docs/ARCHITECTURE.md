# Food Verse AI – System Architecture Documentation

## 1. High-Level Architectural Overview

Food Verse AI is architected as a modular, decoupled full-stack platform providing multimodal food intelligence across computer vision, nutrition estimation, spoilage evaluation, commercial kitchen hygiene monitoring, smart cooking guidance, and personalized meal planning.

```
+-------------------------------------------------------------------------+
|                              REACT FRONTEND                             |
|  - Dashboard           - Food Recognition      - Nutrition Analytics    |
|  - Freshness Detection - Hygiene Monitoring    - Smart Cooking Assistant|
|  - Meal Planner        - Recipe Collection     - Shopping List          |
|  - Analysis History    - User Settings         - Toast & Disclaimers    |
+-------------------------------------------------------------------------+
                                    |
                            HTTP / REST API
                                    v
+-------------------------------------------------------------------------+
|                             FASTAPI BACKEND                             |
|  - Request Validation (Pydantic V2)  - CORS & Error Handling Middleware |
|  - Static Uploads Serving            - Lifespan DB Auto-Seeding         |
+-------------------------------------------------------------------------+
       |                                                 |
       v                                                 v
+--------------------------------+             +---------------------------+
|      SQLAlchemy ORM LAYER      |             |     AI & VISION PIPELINE  |
|  - UserProfile  - FoodAnalysis |             |  - OpenCV Preprocessor    |
|  - Nutrition    - Freshness    |             |  - Laplacian Sharpness    |
|  - Hygiene      - Recipes      |             |  - Spot & Blemish Metrics |
|  - MealPlan     - ShoppingList |             |  - Multimodal Vision API  |
|  - SQLite (Prod Postgres Ready)|             |  - USDA Heuristic Engine  |
+--------------------------------+             +---------------------------+
```

---

## 2. Multimodal AI & Computer Vision Pipeline

The AI engine employs a pluggable, dual-tier strategy:

1. **Computer Vision Preprocessor (`backend/app/ai/cv_analyzer.py`)**:
   - Uses OpenCV (`cv2`) and Pillow (`PIL`) to load and inspect raw image byte buffers.
   - Converts color spaces between RGB, BGR, HSV, and grayscale.
   - Computes:
     - Mean illumination & brightness standard deviation.
     - Dominant hue angles (classifying pigment profiles: greens, reds, warm earth tones, neutrals).
     - Laplacian operator variance for image sharpness and optical blur rejection.
     - Canny edge density to evaluate surface clutter in prep stations.
     - Gaussian difference thresholding to detect localized dark spots, bruising, and fungal patterning.

2. **Multimodal API Integration (`backend/app/ai/multimodal_provider.py`)**:
   - If `GEMINI_API_KEY` is present in the environment, high-dimensional multimodal inferences are queried over HTTPS with strict structured JSON constraints.
   - Image data is passed as base64 payload.

3. **Deterministic CV Fallback Engine (`backend/app/ai/fallback_engine.py`)**:
   - In offline or uncredentialed environments, visual analysis executes locally using OpenCV feature extractions matched against a calibrated USDA food reference dictionary (`nutrition_db.py`).
   - Every inference response contains `ai_provider_used` (`"gemini-multimodal"` or `"opencv-cv-fallback"`) and transparent safety disclaimers.

---

## 3. Data Integrity & Safety Disclaimers

Adhering to strict software safety ethics:
- **Food Safety vs Visual Appearance**: Visual assessment strictly examines physical surface characteristics. It cannot determine microbiological safety (e.g., *Salmonella*, *Listeria*, *E. coli*). The UI and backend prominently display warnings.
- **Strict Allergen Exclusion**: The meal planner and recipe recommendation engines treat declared allergens as non-negotiable negative constraints.
- **Portion & Calorie Transparency**: All calories and macronutrients are explicitly labeled as computational approximations rather than clinical laboratory assays.

