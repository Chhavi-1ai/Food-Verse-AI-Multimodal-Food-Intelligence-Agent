import io
from PIL import Image
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.database import Base, engine

client = TestClient(app)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    from backend.app.database import SessionLocal
    from backend.app.sample_data import seed_database_sample_data
    db = SessionLocal()
    seed_database_sample_data(db)
    db.close()
    yield


def create_test_image_bytes(color=(200, 50, 50), size=(100, 100), format_name="JPEG") -> bytes:
    img = Image.new("RGB", size, color=color)
    buf = io.BytesIO()
    img.save(buf, format=format_name)
    buf.seek(0)
    return buf.getvalue()


# 1. Health check test
def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("healthy", "degraded")
    assert data["database_connected"] is True
    assert "active_features" in data
    assert len(data["active_features"]) >= 5


# 2. Root endpoint test
def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    assert "documentation" in res.json()


# 3. User profile tests
def test_user_profile_endpoints():
    # GET profile
    res = client.get("/api/profile")
    assert res.status_code == 200
    profile = res.json()
    assert "dietary_preference" in profile

    # PUT profile
    update_data = {
        "name": "Chef Antigravity",
        "dietary_preference": "vegetarian",
        "calorie_target": 2200,
        "allergies": ["peanuts", "shellfish"]
    }
    res_put = client.put("/api/profile", json=update_data)
    assert res_put.status_code == 200
    updated = res_put.json()
    assert updated["name"] == "Chef Antigravity"
    assert updated["dietary_preference"] == "vegetarian"
    assert updated["calorie_target"] == 2200
    assert "peanuts" in updated["allergies"]


# 4. Food analysis & upload tests
def test_food_analyze_and_save():
    img_bytes = create_test_image_bytes(color=(220, 40, 40), format_name="JPEG")
    files = {"file": ("apple_test.jpg", img_bytes, "image/jpeg")}
    data = {"food_hint": "apple"}

    res = client.post("/api/food/analyze", files=files, data=data)
    assert res.status_code == 200
    result = res.json()
    assert "food_name" in result
    assert "estimated_calories" in result
    assert result["estimated_calories"] > 0
    assert "portion_grams" in result
    assert "disclaimer_note" in result

    # Test recalculate endpoint
    recalc_payload = {
        "food_name": "apple",
        "portion_grams": 250.0,
        "portion_unit": "grams"
    }
    res_recalc = client.post("/api/food/recalculate", json=recalc_payload)
    assert res_recalc.status_code == 200
    recalc_data = res_recalc.json()
    assert recalc_data["portion_grams"] == 250.0
    assert recalc_data["estimated_calories"] > 0

    # Test saving analysis
    save_payload = {
        "food_name": "apple",
        "portion_grams": 250.0,
        "portion_unit": "grams",
        "portion_description": "Large portion",
        "estimated_calories": recalc_data["estimated_calories"],
        "protein_g": recalc_data["protein_g"],
        "carbs_g": recalc_data["carbs_g"],
        "fat_g": recalc_data["fat_g"],
        "is_user_corrected": True,
        "ai_provider_used": "opencv-cv-fallback",
        "detected_items": []
    }
    res_save = client.post("/api/food/save", json=save_payload)
    assert res_save.status_code == 200
    saved = res_save.json()
    assert saved["id"] is not None
    assert saved["food_name"] == "apple"

    # Test history retrieval
    res_history = client.get("/api/food/history")
    assert res_history.status_code == 200
    history_items = res_history.json()
    assert len(history_items) > 0

    # Test daily summary
    res_summary = client.get("/api/food/daily-summary")
    assert res_summary.status_code == 200
    summary = res_summary.json()
    assert summary["analyses_count"] >= 1


# 5. Food image validation error handling
def test_food_analyze_invalid_file_type():
    fake_txt = io.BytesIO(b"Not an image")
    files = {"file": ("test.txt", fake_txt, "text/plain")}
    res = client.post("/api/food/analyze", files=files)
    assert res.status_code == 400
    assert "Unsupported image format" in res.json()["detail"]


# 6. Freshness analysis tests
def test_freshness_analyze():
    img_bytes = create_test_image_bytes(color=(60, 180, 75), format_name="PNG")
    files = {"file": ("fresh_apple.png", img_bytes, "image/png")}
    data = {"food_hint": "apple", "save_to_history": "true"}

    res = client.post("/api/freshness/analyze", files=files, data=data)
    assert res.status_code == 200
    freshness = res.json()
    assert freshness["visual_status"] in [
        "Appears fresh", "Possible quality deterioration",
        "Visible spoilage indicators", "Unable to determine"
    ]
    assert "safety_disclaimer" in freshness
    assert "microbiological" in freshness["safety_disclaimer"].lower() or "safety" in freshness["safety_disclaimer"].lower()
    assert len(freshness["storage_recommendations"]) > 0

    # Test history
    res_h = client.get("/api/freshness/history")
    assert res_h.status_code == 200
    assert len(res_h.json()) > 0


# 7. Hygiene inspection tests
def test_hygiene_inspections():
    payload = {
        "facility_name": "Test Prep Kitchen",
        "inspector_name": "Inspector Clouseau",
        "inspection_type": "Manual Checklist",
        "checklist_items": [
            {
                "item_key": "prep_clean",
                "category": "Sanitation",
                "title": "Preparation surface cleanliness",
                "description": "Surfaces scrubbed and disinfected",
                "status": "Passed",
                "notes": "Spotless"
            },
            {
                "item_key": "raw_rte_sep",
                "category": "Cross-Contamination",
                "title": "Raw and RTE food separation",
                "description": "Raw items placed underneath",
                "status": "Needs Attention",
                "notes": "Raw chicken packet placed adjacent to salad bowls"
            }
        ]
    }
    res = client.post("/api/hygiene/inspections", json=payload)
    assert res.status_code == 200
    insp = res.json()
    assert insp["id"] is not None
    assert len(insp["unresolved_observations"]) > 0
    assert len(insp["corrective_actions"]) > 0

    # Summary
    res_sum = client.get("/api/hygiene/summary")
    assert res_sum.status_code == 200
    summary = res_sum.json()
    assert summary["total_inspections"] >= 1


# 8. Recipe search and recommendations
def test_recipe_endpoints():
    res = client.get("/api/recipes")
    assert res.status_code == 200
    recipes = res.json()
    assert len(recipes) >= 5

    # Test ingredient recommendation
    rec_payload = {
        "available_ingredients": ["chicken", "lemon", "olive oil", "garlic"],
        "max_cook_time_mins": 45
    }
    res_rec = client.post("/api/recipes/recommend", json=rec_payload)
    assert res_rec.status_code == 200
    matches = res_rec.json()
    assert len(matches) > 0
    assert "match_percentage" in matches[0]

    # Test servings scaling
    first_id = recipes[0]["id"]
    res_scaled = client.get(f"/api/recipes/{first_id}?servings=4")
    assert res_scaled.status_code == 200
    scaled = res_scaled.json()
    assert scaled["target_servings"] == 4
    assert scaled["scaled_calories_total"] > 0

    # Test favorite toggle
    res_fav = client.post(f"/api/recipes/favorites/{first_id}")
    assert res_fav.status_code == 200
    assert "is_favorite" in res_fav.json()


# 9. Meal planner & Shopping list
def test_meal_planner_and_shopping_list():
    plan_payload = {
        "plan_type": "weekly",
        "title": "Pytest Test Week Plan",
        "target_daily_calories": 2100,
        "dietary_preference": "omnivore"
    }
    res = client.post("/api/meal-plans/generate", json=plan_payload)
    assert res.status_code == 200
    plan = res.json()
    assert plan["id"] is not None
    assert len(plan["planned_meals"]) >= 7

    # Generate shopping list from plan
    shop_payload = {"meal_plan_id": plan["id"]}
    res_shop = client.post("/api/shopping-list/generate", json=shop_payload)
    assert res_shop.status_code == 200
    shop_items = res_shop.json()
    assert len(shop_items) > 0

    # Toggle item
    item_id = shop_items[0]["id"]
    res_toggle = client.put(f"/api/shopping-list/{item_id}/toggle")
    assert res_toggle.status_code == 200
    assert res_toggle.json()["is_purchased"] is True
