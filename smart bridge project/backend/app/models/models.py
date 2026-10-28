import json
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime,
    ForeignKey, Text
)
from sqlalchemy.orm import relationship
from backend.app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="Food Verse Explorer")
    email = Column(String(150), default="user@foodverse.ai")
    dietary_preference = Column(String(50), default="omnivore")  # vegetarian, vegan, pescatarian, keto, paleo, omnivore
    allergies_json = Column(Text, default="[]")  # JSON list of strings (e.g. ["peanuts", "shellfish"])
    ingredient_exclusions_json = Column(Text, default="[]")  # JSON list of strings
    calorie_target = Column(Integer, default=2000)
    protein_target_g = Column(Float, default=75.0)
    carb_target_g = Column(Float, default=250.0)
    fat_target_g = Column(Float, default=65.0)
    cooking_time_preference_mins = Column(Integer, default=30)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    meal_plans = relationship("MealPlan", back_populates="user_profile", cascade="all, delete-orphan")

    @property
    def allergies(self):
        try:
            return json.loads(self.allergies_json) if self.allergies_json else []
        except Exception:
            return []

    @allergies.setter
    def allergies(self, val):
        self.allergies_json = json.dumps(val or [])

    @property
    def ingredient_exclusions(self):
        try:
            return json.loads(self.ingredient_exclusions_json) if self.ingredient_exclusions_json else []
        except Exception:
            return []

    @ingredient_exclusions.setter
    def ingredient_exclusions(self, val):
        self.ingredient_exclusions_json = json.dumps(val or [])


class FoodAnalysis(Base):
    __tablename__ = "food_analyses"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    food_name = Column(String(150), nullable=False)
    original_detected_name = Column(String(150), nullable=True)
    confidence = Column(Float, default=0.85)
    portion_grams = Column(Float, default=150.0)
    portion_unit = Column(String(50), default="grams")
    portion_description = Column(String(100), default="1 medium serving")
    estimated_calories = Column(Float, default=250.0)
    protein_g = Column(Float, default=12.0)
    carbs_g = Column(Float, default=30.0)
    fat_g = Column(Float, default=8.0)
    fiber_g = Column(Float, default=4.0)
    sugar_g = Column(Float, default=6.0)
    sodium_mg = Column(Float, default=350.0)
    is_user_corrected = Column(Boolean, default=False)
    ai_provider_used = Column(String(50), default="opencv-fallback")
    is_simulated_or_estimated = Column(Boolean, default=True)
    disclaimer_note = Column(
        Text,
        default="Image-based calorie and portion estimates are calculated approximations and may vary from laboratory values."
    )
    detected_items_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=utcnow)

    @property
    def detected_items(self):
        try:
            return json.loads(self.detected_items_json) if self.detected_items_json else []
        except Exception:
            return []

    @detected_items.setter
    def detected_items(self, val):
        self.detected_items_json = json.dumps(val or [])


class NutritionRecord(Base):
    __tablename__ = "nutrition_records"

    id = Column(Integer, primary_key=True, index=True)
    food_analysis_id = Column(Integer, ForeignKey("food_analyses.id", ondelete="SET NULL"), nullable=True)
    meal_type = Column(String(50), default="snack")  # breakfast, lunch, dinner, snack
    date_str = Column(String(20), index=True)  # YYYY-MM-DD
    food_name = Column(String(150), nullable=False)
    calories = Column(Float, default=0.0)
    protein_g = Column(Float, default=0.0)
    carbs_g = Column(Float, default=0.0)
    fat_g = Column(Float, default=0.0)
    fiber_g = Column(Float, default=0.0)
    sugar_g = Column(Float, default=0.0)
    sodium_mg = Column(Float, default=0.0)
    created_at = Column(DateTime, default=utcnow)


class FreshnessAssessment(Base):
    __tablename__ = "freshness_assessments"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    food_category = Column(String(100), default="Produce")  # Fruit, Vegetable, Dairy, Bakery, etc.
    item_name = Column(String(150), default="Fresh Item")
    visual_status = Column(String(100), default="Appears fresh")  # Appears fresh, Possible quality deterioration, Visible spoilage indicators, Unable to determine
    confidence = Column(Float, default=0.88)
    discoloration_score = Column(Float, default=0.1)  # 0.0 to 1.0
    surface_defect_score = Column(Float, default=0.1)  # 0.0 to 1.0
    detected_visual_characteristics_json = Column(Text, default="[]")
    explanation = Column(Text, default="")
    storage_recommendations_json = Column(Text, default="[]")
    safety_disclaimer = Column(
        Text,
        default="Visual inspection only. Images cannot detect invisible microbiological pathogens, toxins, or bacteria. Never consume food that smells off, feels slimy, or is suspected to be spoiled regardless of visual appearance."
    )
    ai_provider_used = Column(String(50), default="opencv-fallback")
    created_at = Column(DateTime, default=utcnow)

    @property
    def detected_visual_characteristics(self):
        try:
            return json.loads(self.detected_visual_characteristics_json) if self.detected_visual_characteristics_json else []
        except Exception:
            return []

    @detected_visual_characteristics.setter
    def detected_visual_characteristics(self, val):
        self.detected_visual_characteristics_json = json.dumps(val or [])

    @property
    def storage_recommendations(self):
        try:
            return json.loads(self.storage_recommendations_json) if self.storage_recommendations_json else []
        except Exception:
            return []

    @storage_recommendations.setter
    def storage_recommendations(self, val):
        self.storage_recommendations_json = json.dumps(val or [])


class HygieneInspection(Base):
    __tablename__ = "hygiene_inspections"

    id = Column(Integer, primary_key=True, index=True)
    image_filename = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=True)
    facility_name = Column(String(150), default="Main Kitchen")
    inspector_name = Column(String(100), default="Auditor")
    inspection_type = Column(String(50), default="Hybrid Inspection")  # Automated CV Scan, Manual Checklist, Hybrid Inspection
    overall_score = Column(Float, default=92.0)  # 0 - 100
    status = Column(String(50), default="Passed")  # Passed, Needs Attention, Critical Action Required
    detected_observations_json = Column(Text, default="[]")
    unresolved_observations_json = Column(Text, default="[]")
    corrective_actions_json = Column(Text, default="[]")
    safety_disclaimer = Column(
        Text,
        default="Automated image analysis reports only visible physical indicators and surface conditions. It does not certify sanitized bacteriological status or replace statutory public health regulatory audits."
    )
    created_at = Column(DateTime, default=utcnow)

    checklist_items = relationship("HygieneChecklistItem", back_populates="inspection", cascade="all, delete-orphan")

    @property
    def detected_observations(self):
        try:
            return json.loads(self.detected_observations_json) if self.detected_observations_json else []
        except Exception:
            return []

    @detected_observations.setter
    def detected_observations(self, val):
        self.detected_observations_json = json.dumps(val or [])

    @property
    def unresolved_observations(self):
        try:
            return json.loads(self.unresolved_observations_json) if self.unresolved_observations_json else []
        except Exception:
            return []

    @unresolved_observations.setter
    def unresolved_observations(self, val):
        self.unresolved_observations_json = json.dumps(val or [])

    @property
    def corrective_actions(self):
        try:
            return json.loads(self.corrective_actions_json) if self.corrective_actions_json else []
        except Exception:
            return []

    @corrective_actions.setter
    def corrective_actions(self, val):
        self.corrective_actions_json = json.dumps(val or [])


class HygieneChecklistItem(Base):
    __tablename__ = "hygiene_checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    inspection_id = Column(Integer, ForeignKey("hygiene_inspections.id", ondelete="CASCADE"))
    item_key = Column(String(50), nullable=False)
    category = Column(String(100), default="Sanitation")
    title = Column(String(200), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="Passed")  # Passed, Needs Attention, Not Inspected
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    inspection = relationship("HygieneInspection", back_populates="checklist_items")


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, default="")
    cuisine = Column(String(100), default="International")
    meal_type = Column(String(50), default="Dinner")  # Breakfast, Lunch, Dinner, Snack
    prep_time_minutes = Column(Integer, default=15)
    cook_time_minutes = Column(Integer, default=25)
    default_servings = Column(Integer, default=2)
    difficulty = Column(String(50), default="Medium")  # Easy, Medium, Hard
    calories_per_serving = Column(Float, default=450.0)
    protein_g = Column(Float, default=20.0)
    carbs_g = Column(Float, default=45.0)
    fat_g = Column(Float, default=15.0)
    fiber_g = Column(Float, default=6.0)
    ingredients_json = Column(Text, default="[]")  # list of {name, amount, unit, notes}
    substitutions_json = Column(Text, default="{}")  # dict of {ingredient: [alternatives]}
    instructions_json = Column(Text, default="[]")  # list of step strings
    tips_json = Column(Text, default="[]")  # list of tips
    food_safety_reminders_json = Column(Text, default="[]")
    dietary_tags_json = Column(Text, default="[]")  # ["vegetarian", "gluten-free", etc.]
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    favorites = relationship("FavoriteRecipe", back_populates="recipe", cascade="all, delete-orphan")

    @property
    def ingredients(self):
        try:
            return json.loads(self.ingredients_json) if self.ingredients_json else []
        except Exception:
            return []

    @ingredients.setter
    def ingredients(self, val):
        self.ingredients_json = json.dumps(val or [])

    @property
    def substitutions(self):
        try:
            return json.loads(self.substitutions_json) if self.substitutions_json else {}
        except Exception:
            return {}

    @substitutions.setter
    def substitutions(self, val):
        self.substitutions_json = json.dumps(val or {})

    @property
    def instructions(self):
        try:
            return json.loads(self.instructions_json) if self.instructions_json else []
        except Exception:
            return []

    @instructions.setter
    def instructions(self, val):
        self.instructions_json = json.dumps(val or [])

    @property
    def tips(self):
        try:
            return json.loads(self.tips_json) if self.tips_json else []
        except Exception:
            return []

    @tips.setter
    def tips(self, val):
        self.tips_json = json.dumps(val or [])

    @property
    def food_safety_reminders(self):
        try:
            return json.loads(self.food_safety_reminders_json) if self.food_safety_reminders_json else []
        except Exception:
            return []

    @food_safety_reminders.setter
    def food_safety_reminders(self, val):
        self.food_safety_reminders_json = json.dumps(val or [])

    @property
    def dietary_tags(self):
        try:
            return json.loads(self.dietary_tags_json) if self.dietary_tags_json else []
        except Exception:
            return []

    @dietary_tags.setter
    def dietary_tags(self, val):
        self.dietary_tags_json = json.dumps(val or [])


class FavoriteRecipe(Base):
    __tablename__ = "favorite_recipes"

    id = Column(Integer, primary_key=True, index=True)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False)
    notes = Column(Text, default="")
    created_at = Column(DateTime, default=utcnow)

    recipe = relationship("Recipe", back_populates="favorites")


class MealPlan(Base):
    __tablename__ = "meal_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_profile_id = Column(Integer, ForeignKey("user_profiles.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(150), default="Weekly Balanced Nutrition Plan")
    plan_type = Column(String(50), default="weekly")  # daily, weekly
    target_daily_calories = Column(Integer, default=2000)
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    notes = Column(Text, default="Personalized AI Meal Plan with dietary safety guardrails.")
    created_at = Column(DateTime, default=utcnow)

    user_profile = relationship("UserProfile", back_populates="meal_plans")
    planned_meals = relationship("PlannedMeal", back_populates="meal_plan", cascade="all, delete-orphan")


class PlannedMeal(Base):
    __tablename__ = "planned_meals"

    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id", ondelete="CASCADE"), nullable=False)
    recipe_id = Column(Integer, ForeignKey("recipes.id", ondelete="SET NULL"), nullable=True)
    meal_name = Column(String(150), nullable=False)
    meal_type = Column(String(50), default="Lunch")  # Breakfast, Lunch, Dinner, Snack
    day_of_week = Column(String(50), default="Monday")
    servings = Column(Integer, default=1)
    calories = Column(Float, default=400.0)
    protein_g = Column(Float, default=20.0)
    carbs_g = Column(Float, default=45.0)
    fat_g = Column(Float, default=12.0)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

    meal_plan = relationship("MealPlan", back_populates="planned_meals")
    recipe = relationship("Recipe")


class ShoppingListItem(Base):
    __tablename__ = "shopping_list_items"

    id = Column(Integer, primary_key=True, index=True)
    meal_plan_id = Column(Integer, ForeignKey("meal_plans.id", ondelete="SET NULL"), nullable=True)
    item_name = Column(String(150), nullable=False)
    category = Column(String(100), default="Produce")  # Produce, Protein, Dairy, Pantry, Spices, Bakery, Other
    quantity = Column(Float, default=1.0)
    unit = Column(String(50), default="items")
    is_purchased = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow)

