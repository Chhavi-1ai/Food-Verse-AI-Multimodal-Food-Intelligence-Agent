# Food Verse AI – Multimodal Food Intelligence Agent

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?logo=python&logoColor=white)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

A unified, multimodal, AI-powered food intelligence platform combining computer vision, nutrition estimation, freshness and spoilage assessment, commercial kitchen hygiene monitoring, smart cooking assistance, and personalized meal planning.

---

## 🌟 Key Capabilities & Epics

1. **Food Recognition & Nutrition Analysis (Epic 2)**:
   - Drag-and-drop food image upload with format validation (JPEG, PNG, WebP) and size limits.
   - Dual-tier vision inference: Google Gemini Multimodal Vision API or built-in OpenCV heuristic CV analyzer.
   - Real-time portion size adjustments (interactive slider & gram inputs) with automatic nutritional recalculations.
   - User correction workflow with immediate macronutrient re-estimation.
   - Visual macronutrient breakdowns (Protein, Carbs, Fat, Fiber) with Chart.js Doughnut charts.
   - Persistent analysis history with daily nutrition summaries.

2. **Food Freshness & Spoilage Detection (Epic 3)**:
   - Visual inspection of fruits, vegetables, and perishable produce.
   - Four-tier appearance classification:
     - *Appears fresh*
     - *Possible quality deterioration*
     - *Visible spoilage indicators*
     - *Unable to determine*
   - Quantitative surface defect scoring, spot ratio, and edge irregularity indicators.
   - Curated scientific storage recommendations (temperature, humidity, ethylene management).
   - Prominent microbiological food safety disclosures.

3. **Restaurant Hygiene & Kitchen Safety (Epic 4A)**:
   - Automated CV photo scan for prep station surface clutter, brightness, and residue.
   - 8-point HACCP-aligned manual inspection checklist:
     - Preparation surface cleanliness
     - Food storage organization
     - Raw and ready-to-eat food separation
     - Waste accumulation management
     - Handwashing facilities operational
     - Cleaning schedule completion
     - Temperature log verification
     - Pest-control inspection records
   - Automatic compliance score calculation, status assignment (*Passed*, *Needs Attention*, *Critical Action Required*), and actionable corrective measures.

4. **Smart Cooking Assistant (Epic 4B)**:
   - "Cook with what I have" pantry search with match percentage calculations.
   - Step-by-step interactive cooking mode with checkable step progress.
   - Built-in interactive countdown timers with preset shortcuts (5m, 15m, custom).
   - Dynamic serving size scaler: automatically multiplies all ingredient quantities and calories.
   - Ingredient substitution matrix (e.g., coconut aminos for soy sauce, tofu for chicken).
   - Food handling & minimum internal temperature safety reminders.

5. **Personalized Meal Planner & Shopping List (Epic 5)**:
   - Daily and weekly automated meal planning tailored to caloric goals.
   - Support for Omnivore, Vegetarian, Vegan, Pescatarian, Keto, and Paleo patterns.
   - Strict allergen exclusions (Peanuts, Tree nuts, Dairy, Gluten, Shellfish, Eggs, Soy, Fish).
   - Interactive calendar schedule with meal swap/replacement capabilities.
   - One-click shopping list generation grouped by grocery categories (Produce, Protein, Dairy, Pantry, Bakery, Spices) with interactive purchased checkboxes.

6. **Unified Intelligence Dashboard & UX (Epic 6)**:
   - Modern Forest Green (`#166534`) and Fresh Lime (`#22c55e`) design aesthetic on soft off-white cards.
   - Responsive sidebar with 11 connected views.
   - Real-time daily calorie progress rings and activity timelines.
   - Floating toast notification system.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React Router DOM, Chart.js, React-ChartJS-2, Lucide React icons, Responsive CSS3.
- **Backend**: Python 3.11+, FastAPI, Pydantic V2, SQLAlchemy, Uvicorn, SQLite (PostgreSQL compatible).
- **Computer Vision & AI**: OpenCV (`opencv-python-headless`), Pillow (`PIL`), NumPy, Google Gemini Multimodal Vision API, USDA Nutritional Reference Engine.
- **Testing & Tooling**: Pytest, HTTPX, Docker & Docker Compose.

---

## 📂 Project Structure

```
food-verse-ai/
├── frontend/                     # React application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/           # Reusable UI (ImageUploader, NutritionChart, StatCard, etc.)
│   │   ├── layouts/              # MainLayout, Sidebar, Navbar
│   │   ├── pages/                # 11 Major connected views
│   │   ├── services/             # API client (Fetch / Axios wrapper)
│   │   ├── hooks/                # Toast and state hooks
│   │   ├── utils/                # Formatters & badge helpers
│   │   ├── App.jsx               # Route definitions
│   │   ├── App.css               # Animations and responsive styles
│   │   ├── index.css             # Theme variables
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── backend/                      # Python FastAPI application
│   ├── app/
│   │   ├── api/                  # REST routers (food, freshness, hygiene, recipes, meal_plans, profile, system)
│   │   ├── core/                 # Config & environment settings
│   │   ├── models/               # SQLAlchemy ORM models (11 database entities)
│   │   ├── schemas/              # Pydantic V2 request & response schemas
│   │   ├── services/             # Nutrition DB, Recipe Engine, Meal Planner
│   │   ├── ai/                   # OpenCV preprocessor, Gemini vision provider, Heuristic engine
│   │   ├── database.py           # Engine & session management
│   │   ├── sample_data.py        # Automatic database seed data
│   │   └── main.py               # FastAPI entry point & CORS
│   ├── tests/                    # Pytest test suites (9 automated tests)
│   │   └── test_api.py
│   ├── Dockerfile
│   └── requirements.txt
├── uploads/                      # Image uploads directory
├── docs/                         # Architecture & API reference
│   ├── ARCHITECTURE.md
│   └── API_REFERENCE.md
├── .env.example                  # Environment variable template
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18 or higher (v20+ recommended)
- **Git**

---

### Step 1: Clone and Configure Environment

```bash
git clone https://github.com/your-username/food-verse-ai.git
cd food-verse-ai

# Copy environment template
cp .env.example .env
```

*(Optional)* If you have a Google AI Studio key, open `.env` and set:
```ini
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> **Note**: If `GEMINI_API_KEY` is omitted, the application runs seamlessly in local mode using the built-in OpenCV computer vision and USDA reference engine. No fabricated data is returned; output sources are explicitly labeled.

---

### Step 2: Set Up and Start Backend

In a terminal:
```bash
# Install Python dependencies
python -m pip install -r backend/requirements.txt

# Start FastAPI server
python -m uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend starts at `http://localhost:8000`. Database tables and rich initial demo data (sample recipes, food analyses, inspections) initialize automatically.

---

### Step 3: Set Up and Start Frontend

In a separate terminal:
```bash
cd frontend

# Install Node dependencies
npm install

# Start Vite development server
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 🧪 Running Automated Tests

Run the backend test suite:
```bash
python -m pytest backend/tests/test_api.py -v
```

All 9 test suites verify:
- API health check and status reporting
- Root documentation route
- User profile creation and updates
- Food image upload, validation, and AI analysis
- Food file-type validation & error handling (rejects invalid MIME types)
- Freshness assessment classification and safety disclaimers
- Hygiene inspection scoring, checklist validation, and corrective action generation
- Recipe search, ingredient recommendation, serving scaling, and favorites
- Meal plan generation and grocery shopping list creation

---

## 🐳 Docker Deployment

To launch both frontend and backend in isolated Docker containers:

```bash
docker-compose up --build
```
- Frontend available at: `http://localhost:3000`
- Backend API available at: `http://localhost:8000`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

---

## ⚖️ Food Safety & Ethical Disclaimers

1. **Microbiological Safety Notice**: An image can only assess visual characteristics (color, surface texture, and optical defects). It **CANNOT** detect invisible foodborne pathogens (*Salmonella*, *Listeria*, *E. coli*, norovirus) or establish microbiological food safety. Always verify smell, texture, and proper storage temperatures.
2. **Allergen Guardrails**: The meal planner and recipe assistant treat declared allergies as strict exclusions. However, commercial cross-contact risks cannot be verified from images alone.
3. **Nutritional Approximations**: Calorie and macronutrient estimates are calculated approximations based on standard composition references, not certified laboratory assays.

---

## 📄 License
This project is licensed under the MIT License.

