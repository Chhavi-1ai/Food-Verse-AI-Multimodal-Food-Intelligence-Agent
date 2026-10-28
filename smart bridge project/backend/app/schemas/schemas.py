from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ---------------- Profile Schemas ----------------
class UserProfileBase(BaseModel):
    name: str = "Food Verse Explorer"
    email: str = "user@foodverse.ai"
    dietary_preference: str = "omnivore"
    allergies: List[str] = Field(default_factory=list)
    ingredient_exclusions: List[str] = Field(default_factory=list)
    calorie_target: int = Field(default=2000, ge=800, le=5000)
    protein_target_g: float = Field(default=75.0, ge=10.0, le=400.0)
    carb_target_g: float = Field(default=250.0, ge=10.0, le=600.0)
    fat_target_g: float = Field(default=65.0, ge=10.0, le=200.0)
    cooking_time_preference_mins: int = Field(default=30, ge=5, le=180)


class UserProfileCreate(UserProfileBase):
    pass


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    dietary_preference: Optional[str] = None
    allergies: Optional[List[str]] = None
    ingredient_exclusions: Optional[List[str]] = None
    calorie_target: Optional[int] = None
    protein_target_g: Optional[float] = None
    carb_target_g: Optional[float] = None
    fat_target_g: Optional[float] = None
    cooking_time_preference_mins: Optional[int] = None


class UserProfileResponse(UserProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Food Recognition & Nutrition Schemas ----------------
class DetectedFoodItem(BaseModel):
    name: str
    confidence: float
    portion_grams_estimated: float = 100.0
    bounding_box: Optional[Dict[str, float]] = None


class FoodAnalysisResponse(BaseModel):
    id: Optional[int] = None
    image_url: Optional[str] = None
    image_filename: Optional[str] = None
    food_name: str
    original_detected_name: Optional[str] = None
    confidence: float
    portion_grams: float
    portion_unit: str = "grams"
    portion_description: str
    estimated_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    sugar_g: float
    sodium_mg: float
    is_user_corrected: bool = False
    ai_provider_used: str = "opencv-fallback"
    is_simulated_or_estimated: bool = True
    disclaimer_note: str = (
        "Calculated approximation. Visual portion and caloric estimates can vary from laboratory biochemical assays."
    )
    detected_items: List[DetectedFoodItem] = Field(default_factory=list)
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class FoodRecalculateRequest(BaseModel):
    food_name: str
    portion_grams: float = Field(gt=0, le=5000)
    portion_unit: str = "grams"


class FoodAnalysisSaveRequest(BaseModel):
    food_name: str
    original_detected_name: Optional[str] = None
    image_filename: Optional[str] = None
    confidence: float = 0.9
    portion_grams: float
    portion_unit: str = "grams"
    portion_description: str = "1 serving"
    estimated_calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float = 0.0
    sugar_g: float = 0.0
    sodium_mg: float = 0.0
    is_user_corrected: bool = False
    ai_provider_used: str = "opencv-fallback"
    detected_items: List[DetectedFoodItem] = Field(default_factory=list)


class DailyNutritionSummary(BaseModel):
    date: str
    total_calories: float
    total_protein_g: float
    total_carbs_g: float
    total_fat_g: float
    total_fiber_g: float
    total_sodium_mg: float
    calorie_target: int
    analyses_count: int


# ---------------- Food Freshness Schemas ----------------
class FreshnessAssessmentResponse(BaseModel):
    id: Optional[int] = None
    image_url: Optional[str] = None
    image_filename: Optional[str] = None
    food_category: str
    item_name: str
    visual_status: str  # Appears fresh, Possible quality deterioration, Visible spoilage indicators, Unable to determine
    confidence: float
    discoloration_score: float  # 0.0 to 1.0
    surface_defect_score: float  # 0.0 to 1.0
    detected_visual_characteristics: List[str]
    explanation: str
    storage_recommendations: List[str]
    safety_disclaimer: str
    ai_provider_used: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Hygiene Schemas ----------------
class HygieneChecklistItemSchema(BaseModel):
    id: Optional[int] = None
    item_key: str
    category: str
    title: str
    description: str = ""
    status: str = "Passed"  # Passed, Needs Attention, Not Inspected
    notes: Optional[str] = ""

    model_config = ConfigDict(from_attributes=True)


class HygieneInspectionCreate(BaseModel):
    facility_name: str = "Main Kitchen Area"
    inspector_name: str = "Certified Hygiene Inspector"
    inspection_type: str = "Manual Checklist"
    image_filename: Optional[str] = None
    checklist_items: List[HygieneChecklistItemSchema]
    notes: Optional[str] = None


class HygieneInspectionResponse(BaseModel):
    id: int
    image_url: Optional[str] = None
    facility_name: str
    inspector_name: str
    inspection_type: str
    overall_score: float
    status: str
    detected_observations: List[str]
    unresolved_observations: List[str]
    corrective_actions: List[str]
    safety_disclaimer: str
    checklist_items: List[HygieneChecklistItemSchema] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class HygieneSummaryResponse(BaseModel):
    total_inspections: int
    passed_inspections: int
    needs_attention_count: int
    average_hygiene_score: float
    recent_unresolved_issues: List[str]


# ---------------- Recipe & Cooking Assistant Schemas ----------------
class RecipeIngredient(BaseModel):
    name: str
    amount: float
    unit: str
    notes: Optional[str] = None


class RecipeResponse(BaseModel):
    id: int
    title: str
    description: str
    cuisine: str
    meal_type: str
    prep_time_minutes: int
    cook_time_minutes: int
    default_servings: int
    difficulty: str
    calories_per_serving: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    ingredients: List[Dict[str, Any]]
    substitutions: Dict[str, List[str]]
    instructions: List[str]
    tips: List[str]
    food_safety_reminders: List[str]
    dietary_tags: List[str]
    image_url: Optional[str] = None
    is_favorite: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)


class RecipeRecommendationRequest(BaseModel):
    available_ingredients: List[str]
    max_cook_time_mins: Optional[int] = None
    dietary_preference: Optional[str] = None
    exclude_allergies: Optional[List[str]] = None


class RecipeMatch(BaseModel):
    recipe: RecipeResponse
    match_percentage: float
    matching_ingredients: List[str]
    missing_ingredients: List[str]


# ---------------- Meal Planner Schemas ----------------
class PlannedMealResponse(BaseModel):
    id: int
    meal_plan_id: int
    recipe_id: Optional[int] = None
    meal_name: str
    meal_type: str
    day_of_week: str
    servings: int
    calories: float
    protein_g: float
    carbs_g: float
    fat_g: float
    is_completed: bool

    model_config = ConfigDict(from_attributes=True)


class MealPlanResponse(BaseModel):
    id: int
    title: str
    plan_type: str
    target_daily_calories: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    notes: str
    planned_meals: List[PlannedMealResponse] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MealPlanGenerateRequest(BaseModel):
    plan_type: str = "weekly"  # daily or weekly
    title: Optional[str] = None
    target_daily_calories: Optional[int] = None
    dietary_preference: Optional[str] = None
    allergies: Optional[List[str]] = None
    ingredient_exclusions: Optional[List[str]] = None
    max_prep_time_mins: Optional[int] = None


class ReplaceMealRequest(BaseModel):
    meal_id: int
    new_recipe_id: Optional[int] = None
    custom_name: Optional[str] = None


# ---------------- Shopping List Schemas ----------------
class ShoppingListItemSchema(BaseModel):
    id: int
    meal_plan_id: Optional[int] = None
    item_name: str
    category: str
    quantity: float
    unit: str
    is_purchased: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ShoppingListItemCreate(BaseModel):
    item_name: str
    category: str = "Produce"
    quantity: float = 1.0
    unit: str = "items"


class ShoppingListGenerateRequest(BaseModel):
    meal_plan_id: int


# ---------------- Health & System Schemas ----------------
class SystemHealthResponse(BaseModel):
    status: str
    project_name: str
    version: str
    database_connected: bool
    ai_provider: str
    ai_configured: bool
    active_features: List[str]
    current_time: str
