from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import (
    MealPlan, PlannedMeal, ShoppingListItem, UserProfile, Recipe
)
from backend.app.schemas.schemas import (
    MealPlanResponse, MealPlanGenerateRequest, PlannedMealResponse,
    ReplaceMealRequest, ShoppingListItemSchema, ShoppingListItemCreate,
    ShoppingListGenerateRequest
)
from backend.app.services.meal_planner_service import MealPlannerService

router = APIRouter(tags=["Personalized Meal Planner & Shopping List"])


# ---------------- Meal Plans ----------------
@router.post("/meal-plans/generate", response_model=MealPlanResponse)
def generate_meal_plan(
    req: MealPlanGenerateRequest,
    db: Session = Depends(get_db)
):
    profile = db.query(UserProfile).first()
    plan = MealPlannerService.generate_plan(
        db=db,
        profile=profile,
        plan_type=req.plan_type,
        title=req.title,
        target_calories=req.target_daily_calories,
        dietary_preference=req.dietary_preference,
        allergies=req.allergies,
        ingredient_exclusions=req.ingredient_exclusions
    )
    return plan


@router.get("/meal-plans", response_model=List[MealPlanResponse])
def get_meal_plans(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    return (
        db.query(MealPlan)
        .order_by(MealPlan.created_at.desc())
        .limit(limit)
        .all()
    )


@router.get("/meal-plans/{plan_id}", response_model=MealPlanResponse)
def get_meal_plan(plan_id: int, db: Session = Depends(get_db)):
    plan = db.query(MealPlan).filter(MealPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Meal plan not found")
    return plan


@router.put("/meal-plans/replace-meal", response_model=PlannedMealResponse)
def replace_planned_meal(
    req: ReplaceMealRequest,
    db: Session = Depends(get_db)
):
    planned = db.query(PlannedMeal).filter(PlannedMeal.id == req.meal_id).first()
    if not planned:
        raise HTTPException(status_code=404, detail="Planned meal not found")

    if req.new_recipe_id:
        recipe = db.query(Recipe).filter(Recipe.id == req.new_recipe_id).first()
        if not recipe:
            raise HTTPException(status_code=404, detail="Selected replacement recipe not found")
        planned.recipe_id = recipe.id
        planned.meal_name = recipe.title
        planned.calories = recipe.calories_per_serving * planned.servings
        planned.protein_g = recipe.protein_g * planned.servings
        planned.carbs_g = recipe.carbs_g * planned.servings
        planned.fat_g = recipe.fat_g * planned.servings
    elif req.custom_name:
        planned.meal_name = req.custom_name

    db.commit()
    db.refresh(planned)
    return planned


@router.put("/meal-plans/meal/{meal_id}/toggle-complete")
def toggle_meal_complete(meal_id: int, db: Session = Depends(get_db)):
    planned = db.query(PlannedMeal).filter(PlannedMeal.id == meal_id).first()
    if not planned:
        raise HTTPException(status_code=404, detail="Planned meal not found")

    planned.is_completed = not planned.is_completed
    db.commit()
    return {"meal_id": meal_id, "is_completed": planned.is_completed}


# ---------------- Shopping List ----------------
@router.post("/shopping-list/generate", response_model=List[ShoppingListItemSchema])
def generate_shopping_list(
    req: ShoppingListGenerateRequest,
    db: Session = Depends(get_db)
):
    try:
        items = MealPlannerService.generate_shopping_list(db, req.meal_plan_id)
        return items
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/shopping-list", response_model=List[ShoppingListItemSchema])
def get_shopping_list(
    meal_plan_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    q = db.query(ShoppingListItem)
    if meal_plan_id:
        q = q.filter(ShoppingListItem.meal_plan_id == meal_plan_id)
    return q.order_by(ShoppingListItem.category, ShoppingListItem.item_name).all()


@router.post("/shopping-list/item", response_model=ShoppingListItemSchema)
def add_custom_shopping_item(
    req: ShoppingListItemCreate,
    db: Session = Depends(get_db)
):
    item = ShoppingListItem(
        item_name=req.item_name,
        category=req.category,
        quantity=req.quantity,
        unit=req.unit,
        is_purchased=False
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/shopping-list/{item_id}/toggle")
def toggle_shopping_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    item.is_purchased = not item.is_purchased
    db.commit()
    return {"item_id": item.id, "is_purchased": item.is_purchased}


@router.delete("/shopping-list/{item_id}")
def delete_shopping_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(ShoppingListItem).filter(ShoppingListItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Shopping item not found")

    db.delete(item)
    db.commit()
    return {"message": "Shopping item removed"}

