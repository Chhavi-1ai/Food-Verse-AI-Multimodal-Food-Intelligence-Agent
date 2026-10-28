from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.models import Recipe, FavoriteRecipe


class RecipeService:
    @staticmethod
    def search_recipes(
        db: Session,
        query: Optional[str] = None,
        meal_type: Optional[str] = None,
        cuisine: Optional[str] = None,
        max_time: Optional[int] = None,
        dietary_tag: Optional[str] = None,
    ) -> List[Recipe]:
        q = db.query(Recipe)
        if query:
            search_fmt = f"%{query.lower()}%"
            q = q.filter(
                (Recipe.title.ilike(search_fmt)) |
                (Recipe.description.ilike(search_fmt)) |
                (Recipe.cuisine.ilike(search_fmt))
            )
        if meal_type and meal_type.lower() != "all":
            q = q.filter(Recipe.meal_type.ilike(f"%{meal_type}%"))
        if cuisine and cuisine.lower() != "all":
            q = q.filter(Recipe.cuisine.ilike(f"%{cuisine}%"))
        if max_time:
            q = q.filter((Recipe.prep_time_minutes + Recipe.cook_time_minutes) <= max_time)

        recipes = q.all()
        if dietary_tag and dietary_tag.lower() != "all":
            recipes = [
                r for r in recipes
                if any(dietary_tag.lower() in t.lower() for t in r.dietary_tags)
            ]
        return recipes

    @staticmethod
    def recommend_recipes_by_ingredients(
        db: Session,
        available_ingredients: List[str],
        max_cook_time: Optional[int] = None,
        dietary_preference: Optional[str] = None,
        exclude_allergies: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        cleaned_user_items = [item.strip().lower() for item in available_ingredients if item.strip()]
        all_recipes = db.query(Recipe).all()

        results = []
        exclude_allergies_lower = [a.strip().lower() for a in (exclude_allergies or []) if a.strip()]

        for recipe in all_recipes:
            # Check maximum cook time
            total_time = recipe.prep_time_minutes + recipe.cook_time_minutes
            if max_cook_time and total_time > max_cook_time:
                continue

            # Strict Allergy Exclusion
            has_allergen = False
            rec_tags = [t.lower() for t in recipe.dietary_tags]
            for allergen in exclude_allergies_lower:
                for ing in recipe.ingredients:
                    ing_name = ing.get("name", "").lower()
                    if allergen in ing_name or (allergen == "gluten" and "wheat" in ing_name):
                        has_allergen = True
                        break
                if has_allergen:
                    break
            if has_allergen:
                continue

            # Dietary preference filter
            if dietary_preference:
                pref_lower = dietary_preference.lower()
                if pref_lower in ("vegetarian", "vegan", "keto", "gluten-free"):
                    if not any(pref_lower in tag for tag in rec_tags):
                        continue

            # Compute ingredient overlap
            matching = []
            missing = []
            recipe_ingredients = recipe.ingredients
            if not recipe_ingredients:
                continue

            for ing in recipe_ingredients:
                ing_name = ing.get("name", "").strip().lower()
                matched = False
                for user_item in cleaned_user_items:
                    if user_item in ing_name or ing_name in user_item:
                        matched = True
                        break
                if matched:
                    matching.append(ing.get("name"))
                else:
                    missing.append(ing.get("name"))

            match_pct = round((len(matching) / max(1, len(recipe_ingredients))) * 100, 1)

            # Check favorite status
            is_fav = db.query(FavoriteRecipe).filter(FavoriteRecipe.recipe_id == recipe.id).first() is not None

            # Build recipe response
            recipe_dict = {
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

            results.append({
                "recipe": recipe_dict,
                "match_percentage": match_pct,
                "matching_ingredients": matching,
                "missing_ingredients": missing,
            })

        # Sort by match percentage descending
        results.sort(key=lambda x: x["match_percentage"], reverse=True)
        return results

    @staticmethod
    def scale_recipe_servings(recipe: Recipe, target_servings: int) -> Dict[str, Any]:
        """Scales recipe ingredients and calories according to the requested servings."""
        if target_servings <= 0:
            target_servings = recipe.default_servings

        multiplier = target_servings / max(1, recipe.default_servings)
        scaled_ingredients = []

        for ing in recipe.ingredients:
            orig_amt = ing.get("amount", 1.0)
            scaled_ingredients.append({
                "name": ing.get("name"),
                "amount": round(orig_amt * multiplier, 2),
                "unit": ing.get("unit"),
                "notes": ing.get("notes")
            })

        return {
            "recipe_id": recipe.id,
            "title": recipe.title,
            "target_servings": target_servings,
            "default_servings": recipe.default_servings,
            "scaled_calories_total": round(recipe.calories_per_serving * target_servings, 1),
            "calories_per_serving": recipe.calories_per_serving,
            "ingredients": scaled_ingredients,
            "substitutions": recipe.substitutions,
            "instructions": recipe.instructions,
            "tips": recipe.tips,
            "food_safety_reminders": recipe.food_safety_reminders,
        }

