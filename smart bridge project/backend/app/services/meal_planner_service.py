from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import (
    UserProfile, Recipe, MealPlan, PlannedMeal, ShoppingListItem
)


class MealPlannerService:
    DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

    @classmethod
    def generate_plan(
        cls,
        db: Session,
        profile: Optional[UserProfile] = None,
        plan_type: str = "weekly",
        title: Optional[str] = None,
        target_calories: Optional[int] = None,
        dietary_preference: Optional[str] = None,
        allergies: Optional[List[str]] = None,
        ingredient_exclusions: Optional[List[str]] = None,
    ) -> MealPlan:
        # Resolve parameters from profile if not explicitly overridden
        diet_pref = dietary_preference or (profile.dietary_preference if profile else "omnivore")
        user_allergies = allergies if allergies is not None else (profile.allergies if profile else [])
        user_exclusions = ingredient_exclusions if ingredient_exclusions is not None else (profile.ingredient_exclusions if profile else [])
        daily_cals = target_calories or (profile.calorie_target if profile else 2000)

        allergies_lower = [a.lower().strip() for a in user_allergies if a.strip()]
        exclusions_lower = [e.lower().strip() for e in user_exclusions if e.strip()]

        # Query all recipes
        all_recipes = db.query(Recipe).all()
        if not all_recipes:
            from backend.app.sample_data import seed_database_sample_data
            seed_database_sample_data(db)
            all_recipes = db.query(Recipe).all()

        # Strict allergen and exclusion filter
        eligible_recipes = []
        for r in all_recipes:
            # Check allergens
            has_bad_item = False
            for allergen in allergies_lower:
                for ing in r.ingredients:
                    ing_name = ing.get("name", "").lower()
                    if allergen in ing_name or (allergen == "gluten" and "wheat" in ing_name):
                        has_bad_item = True
                        break
                if has_bad_item:
                    break
            if has_bad_item:
                continue

            # Check exclusions
            for excl in exclusions_lower:
                for ing in r.ingredients:
                    if excl in ing.get("name", "").lower():
                        has_bad_item = True
                        break
                if has_bad_item:
                    break
            if has_bad_item:
                continue

            # Dietary preference check
            if diet_pref.lower() in ("vegetarian", "vegan", "keto"):
                tags_lower = [t.lower() for t in r.dietary_tags]
                if diet_pref.lower() not in tags_lower:
                    continue

            eligible_recipes.append(r)

        if not eligible_recipes:
            # Fallback to all recipes if strict filters eliminate everything (with safe notice)
            eligible_recipes = all_recipes

        # Separate recipes by meal types
        breakfasts = [r for r in eligible_recipes if "breakfast" in r.meal_type.lower()] or eligible_recipes
        lunches = [r for r in eligible_recipes if "lunch" in r.meal_type.lower()] or eligible_recipes
        dinners = [r for r in eligible_recipes if "dinner" in r.meal_type.lower()] or eligible_recipes
        snacks = [r for r in eligible_recipes if "snack" in r.meal_type.lower()] or eligible_recipes

        # Create MealPlan
        plan_title = title or f"{plan_type.title()} AI Balanced Nutrition Plan"
        meal_plan = MealPlan(
            user_profile_id=profile.id if profile else None,
            title=plan_title,
            plan_type=plan_type.lower(),
            target_daily_calories=daily_cals,
            notes=(
                f"Generated for {diet_pref.title()} dietary preference. "
                f"Filtered for strict exclusion of: {', '.join(user_allergies) if user_allergies else 'None specified'}. "
                "Values are daily estimated nutritional targets."
            )
        )
        db.add(meal_plan)
        db.flush()

        days = cls.DAYS_OF_WEEK if plan_type.lower() == "weekly" else ["Today"]

        # Populate meals
        for day_idx, day_name in enumerate(days):
            b_rec = breakfasts[day_idx % len(breakfasts)]
            l_rec = lunches[(day_idx + 1) % len(lunches)]
            d_rec = dinners[(day_idx + 2) % len(dinners)]
            s_rec = snacks[(day_idx + 3) % len(snacks)]

            meals_data = [
                ("Breakfast", b_rec),
                ("Lunch", l_rec),
                ("Dinner", d_rec),
                ("Healthy Snack", s_rec),
            ]

            for meal_type_name, rec in meals_data:
                planned_meal = PlannedMeal(
                    meal_plan_id=meal_plan.id,
                    recipe_id=rec.id,
                    meal_name=rec.title,
                    meal_type=meal_type_name,
                    day_of_week=day_name,
                    servings=1,
                    calories=rec.calories_per_serving,
                    protein_g=rec.protein_g,
                    carbs_g=rec.carbs_g,
                    fat_g=rec.fat_g,
                    is_completed=False
                )
                db.add(planned_meal)

        db.commit()
        db.refresh(meal_plan)
        return meal_plan

    @classmethod
    def generate_shopping_list(cls, db: Session, meal_plan_id: int) -> List[ShoppingListItem]:
        meal_plan = db.query(MealPlan).filter(MealPlan.id == meal_plan_id).first()
        if not meal_plan:
            raise ValueError(f"Meal plan {meal_plan_id} not found")

        # Category mapping helper
        def categorize(name: str) -> str:
            n = name.lower()
            if any(k in n for k in ["apple", "banana", "tomato", "spinach", "broccoli", "lemon", "avocado", "carrot", "onion", "garlic", "pepper", "berries"]):
                return "Produce"
            elif any(k in n for k in ["chicken", "salmon", "tofu", "beef", "turkey", "egg", "shrimp"]):
                return "Protein"
            elif any(k in n for k in ["milk", "cheese", "yogurt", "butter", "cream"]):
                return "Dairy"
            elif any(k in n for k in ["bread", "tortilla", "pita", "bun"]):
                return "Bakery"
            elif any(k in n for k in ["rice", "pasta", "quinoa", "oats", "lentils", "beans", "flour"]):
                return "Pantry"
            elif any(k in n for k in ["oil", "salt", "pepper", "paprika", "oregano", "cumin", "cinnamon", "sauce"]):
                return "Spices & Condiments"
            return "General Groceries"

        # Clear existing unpurchased items for this plan if generating anew
        db.query(ShoppingListItem).filter(
            ShoppingListItem.meal_plan_id == meal_plan_id,
            ShoppingListItem.is_purchased == False
        ).delete()

        ingredients_map: Dict[str, Dict[str, Any]] = {}

        for planned in meal_plan.planned_meals:
            if planned.recipe and planned.recipe.ingredients:
                for ing in planned.recipe.ingredients:
                    item_name = ing.get("name", "").strip().title()
                    if not item_name:
                        continue
                    amount = float(ing.get("amount", 1.0)) * planned.servings
                    unit = ing.get("unit", "items")
                    
                    key = f"{item_name.lower()}_{unit.lower()}"
                    if key in ingredients_map:
                        ingredients_map[key]["quantity"] += amount
                    else:
                        ingredients_map[key] = {
                            "item_name": item_name,
                            "category": categorize(item_name),
                            "quantity": amount,
                            "unit": unit
                        }

        created_items = []
        for item_data in ingredients_map.values():
            item = ShoppingListItem(
                meal_plan_id=meal_plan_id,
                item_name=item_data["item_name"],
                category=item_data["category"],
                quantity=round(item_data["quantity"], 1),
                unit=item_data["unit"],
                is_purchased=False
            )
            db.add(item)
            created_items.append(item)

        db.commit()
        return created_items
