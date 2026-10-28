from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from backend.app.database import get_db
from backend.app.core.config import settings
from backend.app.schemas.schemas import SystemHealthResponse
from backend.app.sample_data import seed_database_sample_data
from backend.app.models.models import (
    FoodAnalysis, FreshnessAssessment, HygieneInspection,
    Recipe, FavoriteRecipe, MealPlan, ShoppingListItem, NutritionRecord, UserProfile
)

router = APIRouter(tags=["System & Diagnostics"])


@router.get("/health", response_model=SystemHealthResponse)
def health_check(db: Session = Depends(get_db)):
    db_connected = False
    try:
        db.execute(text("SELECT 1"))
        db_connected = True
    except Exception:
        db_connected = False

    ai_configured = settings.has_ai_credentials
    ai_provider = "Google Gemini Multimodal AI" if ai_configured else "OpenCV Heuristic CV Engine (Local Fallback)"

    return {
        "status": "healthy" if db_connected else "degraded",
        "project_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database_connected": db_connected,
        "ai_provider": ai_provider,
        "ai_configured": ai_configured,
        "active_features": [
            "Food Recognition & Nutrition Estimation",
            "Food Freshness & Spoilage Detection",
            "Restaurant Hygiene Inspection & Scoring",
            "Smart Cooking Assistant & Recipe Scaling",
            "Personalized Meal Planner & Allergen Safety Guardrails",
            "Dynamic Shopping List Generation"
        ],
        "current_time": datetime.now(timezone.utc).isoformat()
    }


@router.post("/seed-sample-data")
def seed_data(db: Session = Depends(get_db)):
    seed_database_sample_data(db)
    return {"message": "Sample database seed successfully executed"}


@router.get("/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    recent_food = db.query(FoodAnalysis).order_by(FoodAnalysis.created_at.desc()).limit(5).all()
    recent_fresh = db.query(FreshnessAssessment).order_by(FreshnessAssessment.created_at.desc()).limit(5).all()
    recent_hygiene = db.query(HygieneInspection).order_by(HygieneInspection.created_at.desc()).limit(4).all()
    fav_recipes = db.query(FavoriteRecipe).limit(4).all()
    current_plan = db.query(MealPlan).order_by(MealPlan.created_at.desc()).first()

    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    today_records = db.query(NutritionRecord).filter(NutritionRecord.date_str == today_str).all()

    today_cals = sum(r.calories for r in today_records)
    today_prot = sum(r.protein_g for r in today_records)
    today_carbs = sum(r.carbs_g for r in today_records)
    today_fat = sum(r.fat_g for r in today_records)

    return {
        "user_profile": {
            "name": profile.name if profile else "Explorer",
            "dietary_preference": profile.dietary_preference if profile else "omnivore",
            "calorie_target": profile.calorie_target if profile else 2000,
            "protein_target_g": profile.protein_target_g if profile else 75.0,
            "carb_target_g": profile.carb_target_g if profile else 250.0,
            "fat_target_g": profile.fat_target_g if profile else 65.0,
        },
        "daily_nutrition": {
            "consumed_calories": round(today_cals, 1),
            "consumed_protein_g": round(today_prot, 1),
            "consumed_carbs_g": round(today_carbs, 1),
            "consumed_fat_g": round(today_fat, 1),
            "target_calories": profile.calorie_target if profile else 2000,
        },
        "recent_food_analyses": [
            {
                "id": f.id,
                "food_name": f.food_name,
                "calories": f.estimated_calories,
                "protein_g": f.protein_g,
                "carbs_g": f.carbs_g,
                "fat_g": f.fat_g,
                "portion_grams": f.portion_grams,
                "confidence": f.confidence,
                "image_url": f.image_url,
                "created_at": f.created_at.isoformat() if f.created_at else None,
            }
            for f in recent_food
        ],
        "recent_freshness_assessments": [
            {
                "id": fa.id,
                "item_name": fa.item_name,
                "food_category": fa.food_category,
                "visual_status": fa.visual_status,
                "confidence": fa.confidence,
                "image_url": fa.image_url,
                "created_at": fa.created_at.isoformat() if fa.created_at else None,
            }
            for fa in recent_fresh
        ],
        "recent_hygiene_inspections": [
            {
                "id": hi.id,
                "facility_name": hi.facility_name,
                "inspection_type": hi.inspection_type,
                "overall_score": hi.overall_score,
                "status": hi.status,
                "created_at": hi.created_at.isoformat() if hi.created_at else None,
            }
            for hi in recent_hygiene
        ],
        "current_meal_plan": {
            "id": current_plan.id if current_plan else None,
            "title": current_plan.title if current_plan else "No Active Meal Plan",
            "meals_count": len(current_plan.planned_meals) if current_plan else 0,
            "upcoming_meals": [
                {
                    "id": m.id,
                    "meal_name": m.meal_name,
                    "meal_type": m.meal_type,
                    "day_of_week": m.day_of_week,
                    "calories": m.calories,
                    "is_completed": m.is_completed,
                }
                for m in (current_plan.planned_meals[:6] if current_plan else [])
            ]
        },
        "favorite_recipes": [
            {
                "id": fav.recipe.id,
                "title": fav.recipe.title,
                "cuisine": fav.recipe.cuisine,
                "prep_time_minutes": fav.recipe.prep_time_minutes,
                "cook_time_minutes": fav.recipe.cook_time_minutes,
                "calories_per_serving": fav.recipe.calories_per_serving,
                "image_url": fav.recipe.image_url,
            }
            for fav in fav_recipes if fav.recipe
        ],
        "stats": {
            "total_food_scanned": db.query(FoodAnalysis).count(),
            "total_freshness_checked": db.query(FreshnessAssessment).count(),
            "total_inspections": db.query(HygieneInspection).count(),
            "total_recipes_available": db.query(Recipe).count(),
        }
    }

