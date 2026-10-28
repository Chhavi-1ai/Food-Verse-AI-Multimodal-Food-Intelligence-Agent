from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import Recipe, FavoriteRecipe
from backend.app.schemas.schemas import (
    RecipeResponse, RecipeRecommendationRequest, RecipeMatch
)
from backend.app.services.recipe_service import RecipeService

router = APIRouter(prefix="/recipes", tags=["Smart Cooking Assistant & Recipes"])


@router.get("", response_model=List[RecipeResponse])
def get_recipes(
    query: Optional[str] = Query(None),
    meal_type: Optional[str] = Query(None),
    cuisine: Optional[str] = Query(None),
    max_time: Optional[int] = Query(None),
    dietary_tag: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    recipes = RecipeService.search_recipes(
        db=db,
        query=query,
        meal_type=meal_type,
        cuisine=cuisine,
        max_time=max_time,
        dietary_tag=dietary_tag,
    )
    
    # Enrich with is_favorite
    fav_ids = {f.recipe_id for f in db.query(FavoriteRecipe).all()}
    results = []
    for r in recipes:
        r_dict = {
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "cuisine": r.cuisine,
            "meal_type": r.meal_type,
            "prep_time_minutes": r.prep_time_minutes,
            "cook_time_minutes": r.cook_time_minutes,
            "default_servings": r.default_servings,
            "difficulty": r.difficulty,
            "calories_per_serving": r.calories_per_serving,
            "protein_g": r.protein_g,
            "carbs_g": r.carbs_g,
            "fat_g": r.fat_g,
            "fiber_g": r.fiber_g,
            "ingredients": r.ingredients,
            "substitutions": r.substitutions,
            "instructions": r.instructions,
            "tips": r.tips,
            "food_safety_reminders": r.food_safety_reminders,
            "dietary_tags": r.dietary_tags,
            "image_url": r.image_url,
            "is_favorite": r.id in fav_ids,
        }
        results.append(r_dict)
    return results


@router.post("/recommend", response_model=List[RecipeMatch])
def recommend_recipes(
    req: RecipeRecommendationRequest,
    db: Session = Depends(get_db)
):
    matches = RecipeService.recommend_recipes_by_ingredients(
        db=db,
        available_ingredients=req.available_ingredients,
        max_cook_time=req.max_cook_time_mins,
        dietary_preference=req.dietary_preference,
        exclude_allergies=req.exclude_allergies,
    )
    return matches


@router.get("/favorites/list", response_model=List[RecipeResponse])
def get_favorite_recipes(db: Session = Depends(get_db)):
    favorites = db.query(FavoriteRecipe).all()
    fav_recipes = []
    for f in favorites:
        r = f.recipe
        if r:
            fav_recipes.append({
                "id": r.id,
                "title": r.title,
                "description": r.description,
                "cuisine": r.cuisine,
                "meal_type": r.meal_type,
                "prep_time_minutes": r.prep_time_minutes,
                "cook_time_minutes": r.cook_time_minutes,
                "default_servings": r.default_servings,
                "difficulty": r.difficulty,
                "calories_per_serving": r.calories_per_serving,
                "protein_g": r.protein_g,
                "carbs_g": r.carbs_g,
                "fat_g": r.fat_g,
                "fiber_g": r.fiber_g,
                "ingredients": r.ingredients,
                "substitutions": r.substitutions,
                "instructions": r.instructions,
                "tips": r.tips,
                "food_safety_reminders": r.food_safety_reminders,
                "dietary_tags": r.dietary_tags,
                "image_url": r.image_url,
                "is_favorite": True,
            })
    return fav_recipes


@router.post("/favorites/{recipe_id}")
def toggle_favorite_recipe(recipe_id: int, db: Session = Depends(get_db)):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    existing = db.query(FavoriteRecipe).filter(FavoriteRecipe.recipe_id == recipe_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"recipe_id": recipe_id, "is_favorite": False, "message": "Removed from favorites"}
    else:
        fav = FavoriteRecipe(recipe_id=recipe_id)
        db.add(fav)
        db.commit()
        return {"recipe_id": recipe_id, "is_favorite": True, "message": "Added to favorites"}


@router.get("/{recipe_id}")
def get_recipe(
    recipe_id: int,
    servings: Optional[int] = Query(None, ge=1, le=20),
    db: Session = Depends(get_db)
):
    recipe = db.query(Recipe).filter(Recipe.id == recipe_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")

    is_fav = db.query(FavoriteRecipe).filter(FavoriteRecipe.recipe_id == recipe_id).first() is not None

    if servings and servings != recipe.default_servings:
        scaled = RecipeService.scale_recipe_servings(recipe, servings)
        scaled["is_favorite"] = is_fav
        scaled["cuisine"] = recipe.cuisine
        scaled["meal_type"] = recipe.meal_type
        scaled["prep_time_minutes"] = recipe.prep_time_minutes
        scaled["cook_time_minutes"] = recipe.cook_time_minutes
        scaled["difficulty"] = recipe.difficulty
        scaled["dietary_tags"] = recipe.dietary_tags
        scaled["image_url"] = recipe.image_url
        return scaled

    return {
        "id": recipe.id,
        "title": recipe.title,
        "description": recipe.description,
        "cuisine": recipe.cuisine,
        "meal_type": recipe.meal_type,
        "prep_time_minutes": recipe.prep_time_minutes,
        "cook_time_minutes": recipe.cook_time_minutes,
        "default_servings": recipe.default_servings,
        "difficulty": recipe.difficulty,
        "calories_per_serving": recipe.calories_per_serving,
        "protein_g": recipe.protein_g,
        "carbs_g": recipe.carbs_g,
        "fat_g": recipe.fat_g,
        "fiber_g": recipe.fiber_g,
        "ingredients": recipe.ingredients,
        "substitutions": recipe.substitutions,
        "instructions": recipe.instructions,
        "tips": recipe.tips,
        "food_safety_reminders": recipe.food_safety_reminders,
        "dietary_tags": recipe.dietary_tags,
        "image_url": recipe.image_url,
        "is_favorite": is_fav,
    }

