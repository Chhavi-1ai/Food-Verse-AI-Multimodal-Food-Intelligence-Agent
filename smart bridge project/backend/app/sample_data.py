import json
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from backend.app.models.models import (
    UserProfile, Recipe, FavoriteRecipe, FoodAnalysis,
    FreshnessAssessment, HygieneInspection, HygieneChecklistItem,
    MealPlan, PlannedMeal, ShoppingListItem
)


def seed_database_sample_data(db: Session):
    """Populates database with rich, production-grade initial sample data if empty."""

    # 1. User Profile
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile(
            name="Chef Alex Rivera",
            email="alex.rivera@foodverse.ai",
            dietary_preference="omnivore",
            allergies_json=json.dumps(["peanuts"]),
            ingredient_exclusions_json=json.dumps(["cilantro"]),
            calorie_target=2100,
            protein_target_g=85.0,
            carb_target_g=230.0,
            fat_target_g=65.0,
            cooking_time_preference_mins=35,
        )
        db.add(profile)
        db.flush()

    # 2. Recipes
    if db.query(Recipe).count() == 0:
        recipes_data = [
            {
                "title": "Mediterranean Grilled Lemon Herb Chicken",
                "description": "Juicy grilled chicken breasts marinated in fresh lemon juice, extra virgin olive oil, garlic, and Mediterranean herbs.",
                "cuisine": "Mediterranean",
                "meal_type": "Dinner",
                "prep_time_minutes": 15,
                "cook_time_minutes": 20,
                "default_servings": 2,
                "difficulty": "Easy",
                "calories_per_serving": 380.0,
                "protein_g": 38.0,
                "carbs_g": 6.0,
                "fat_g": 18.0,
                "fiber_g": 1.5,
                "ingredients": [
                    {"name": "chicken breast", "amount": 350, "unit": "grams", "notes": "boneless, skinless"},
                    {"name": "olive oil", "amount": 2, "unit": "tbsp", "notes": "extra virgin"},
                    {"name": "lemon juice", "amount": 2, "unit": "tbsp", "notes": "freshly squeezed"},
                    {"name": "garlic", "amount": 3, "unit": "cloves", "notes": "minced"},
                    {"name": "oregano", "amount": 1, "unit": "tsp", "notes": "dried"},
                    {"name": "salt", "amount": 0.5, "unit": "tsp", "notes": "kosher salt"},
                    {"name": "black pepper", "amount": 0.5, "unit": "tsp", "notes": "freshly cracked"}
                ],
                "substitutions": {
                    "chicken breast": ["firm tofu", "turkey cutlets", "portobello mushroom caps"],
                    "lemon juice": ["white wine vinegar", "lime juice"],
                    "oregano": ["thyme", "rosemary", "Italian seasoning"]
                },
                "instructions": [
                    "Whisk together olive oil, lemon juice, minced garlic, oregano, salt, and pepper in a shallow marinade dish.",
                    "Pat chicken breasts dry with clean paper towels. Submerge in marinade, coating both sides evenly.",
                    "Preheat grill pan or outdoor grill to medium-high heat (approx 200°C / 400°F).",
                    "Grill chicken for 6 to 8 minutes per side without moving until internal temp reaches 74°C (165°F).",
                    "Transfer to a warm cutting board and let rest for 5 minutes before slicing across the grain."
                ],
                "tips": [
                    "Pound thick ends of chicken breasts with a meat mallet to ensure uniform cooking.",
                    "Always rest poultry to retain savory juices inside the meat fibers."
                ],
                "food_safety_reminders": [
                    "Sanitize cutting boards immediately after contact with raw poultry.",
                    "Always verify 74°C (165°F) internal temperature with a calibrated digital meat thermometer."
                ],
                "dietary_tags": ["High Protein", "Low Carb", "Gluten-Free", "Mediterranean"],
                "image_url": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop"
            },
            {
                "title": "Vibrant Quinoa & Roasted Veggie Power Bowl",
                "description": "Nutrient-packed bowl featuring fluffy tricolor quinoa, roasted broccoli, cherry tomatoes, and creamy avocado tahini dressing.",
                "cuisine": "Contemporary Healthy",
                "meal_type": "Lunch",
                "prep_time_minutes": 15,
                "cook_time_minutes": 25,
                "default_servings": 2,
                "difficulty": "Easy",
                "calories_per_serving": 420.0,
                "protein_g": 14.0,
                "carbs_g": 54.0,
                "fat_g": 16.0,
                "fiber_g": 9.5,
                "ingredients": [
                    {"name": "quinoa", "amount": 1, "unit": "cup", "notes": "rinsed well"},
                    {"name": "broccoli", "amount": 2, "unit": "cups", "notes": "cut into bite-size florets"},
                    {"name": "tomato", "amount": 1, "unit": "cup", "notes": "cherry tomatoes halved"},
                    {"name": "avocado", "amount": 1, "unit": "item", "notes": "sliced"},
                    {"name": "olive oil", "amount": 1.5, "unit": "tbsp", "notes": "for roasting"},
                    {"name": "tahini", "amount": 2, "unit": "tbsp", "notes": "sesame paste"}
                ],
                "substitutions": {
                    "quinoa": ["brown rice", "farro", "cauliflower rice"],
                    "tahini": ["cashew butter", "Greek yogurt with lemon", "hummus"]
                },
                "instructions": [
                    "Cook rinsed quinoa in 2 cups of boiling water or vegetable broth for 15 minutes until liquid is absorbed. Fluff with fork.",
                    "Toss broccoli florets and cherry tomatoes in olive oil with salt and pepper.",
                    "Spread vegetables onto baking sheet and roast at 200°C (400°F) for 20 minutes until edges caramelize.",
                    "Whisk tahini with 2 tbsp warm water, lemon juice, and salt until smooth and pourable.",
                    "Divide warm quinoa between bowls, top with roasted vegetables, fresh sliced avocado, and drizzle tahini dressing."
                ],
                "tips": [
                    "Roast tomatoes cut-side up to concentrate natural sugars without leaking juice onto the pan.",
                    "Rinsing quinoa removes naturally occurring bitter saponins."
                ],
                "food_safety_reminders": [
                    "Wash all produce under cold running water prior to knife cutting.",
                    "Cool leftover cooked quinoa within 1 hour before placing in refrigerator."
                ],
                "dietary_tags": ["Vegetarian", "Vegan", "Gluten-Free", "High Fiber"],
                "image_url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop"
            },
            {
                "title": "Avocado & Poached Egg Protein Sourdough",
                "description": "Toasted artisan sourdough loaded with mashed ripe avocado, perfectly poached free-range egg, microgreens, and chili flakes.",
                "cuisine": "Modern Brunch",
                "meal_type": "Breakfast",
                "prep_time_minutes": 10,
                "cook_time_minutes": 5,
                "default_servings": 1,
                "difficulty": "Easy",
                "calories_per_serving": 330.0,
                "protein_g": 14.5,
                "carbs_g": 28.0,
                "fat_g": 18.0,
                "fiber_g": 6.0,
                "ingredients": [
                    {"name": "sourdough bread", "amount": 1, "unit": "slice", "notes": "thick cut"},
                    {"name": "avocado", "amount": 0.5, "unit": "item", "notes": "ripe Hass avocado"},
                    {"name": "egg", "amount": 1, "unit": "item", "notes": "fresh pasture-raised"},
                    {"name": "lemon juice", "amount": 1, "unit": "tsp", "notes": "fresh"},
                    {"name": "red pepper flakes", "amount": 0.25, "unit": "tsp", "notes": "for garnish"}
                ],
                "substitutions": {
                    "sourdough bread": ["gluten-free artisan bread", "rye bread", "whole wheat toast"],
                    "egg": ["smoked salmon", "seared tempeh strips", "hemp hearts"]
                },
                "instructions": [
                    "Toast sourdough slice until golden brown with crisp crust.",
                    "Mash avocado half with fork, adding lemon juice, sea salt, and black pepper.",
                    "Bring water with 1 tbsp white vinegar to a gentle simmer. Create a vortex and drop egg in; poach for 3 minutes.",
                    "Spread seasoned avocado generously over the warm toast.",
                    "Carefully lift poached egg with slotted spoon, drain excess liquid, and crown the avocado toast. Finish with chili flakes."
                ],
                "tips": [
                    "Vinegar in the poaching water helps egg whites coagulate faster into a tight sphere.",
                    "Use fresh eggs whose whites are viscous rather than watery."
                ],
                "food_safety_reminders": [
                    "Store raw shell eggs refrigerated at <4°C.",
                    "Ensure eggs have intact, uncracked shells before handling."
                ],
                "dietary_tags": ["Vegetarian", "High Protein", "Breakfast"],
                "image_url": "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop"
            },
            {
                "title": "Hearty Golden Lentil & Turmeric Soup",
                "description": "Warming red lentils simmered in aromatic broth with garlic, ginger, cumin, and fresh baby spinach.",
                "cuisine": "Middle Eastern / Indian",
                "meal_type": "Dinner",
                "prep_time_minutes": 10,
                "cook_time_minutes": 25,
                "default_servings": 4,
                "difficulty": "Easy",
                "calories_per_serving": 260.0,
                "protein_g": 16.0,
                "carbs_g": 42.0,
                "fat_g": 4.0,
                "fiber_g": 11.0,
                "ingredients": [
                    {"name": "red lentils", "amount": 1.5, "unit": "cups", "notes": "rinsed"},
                    {"name": "onion", "amount": 1, "unit": "item", "notes": "diced"},
                    {"name": "garlic", "amount": 4, "unit": "cloves", "notes": "minced"},
                    {"name": "ginger", "amount": 1, "unit": "tbsp", "notes": "grated"},
                    {"name": "turmeric", "amount": 1, "unit": "tsp", "notes": "ground"},
                    {"name": "spinach", "amount": 2, "unit": "cups", "notes": "fresh baby leaves"},
                    {"name": "vegetable broth", "amount": 4, "unit": "cups", "notes": "low sodium"}
                ],
                "substitutions": {
                    "red lentils": ["yellow split peas", "brown lentils (cook 15 mins longer)"],
                    "spinach": ["kale", "Swiss chard"]
                },
                "instructions": [
                    "Sauté diced onion in olive oil over medium heat until translucent, about 5 minutes.",
                    "Stir in minced garlic, grated ginger, turmeric, and cumin until fragrant (about 60 seconds).",
                    "Add rinsed red lentils and vegetable broth. Bring to rolling boil, then reduce heat to simmer for 20 minutes.",
                    "Stir in fresh baby spinach leaves during the final 2 minutes until wilted.",
                    "Ladle into bowls and serve with fresh lemon wedges."
                ],
                "tips": [
                    "Red lentils break down naturally, creating a thick, velvety texture without requiring cream."
                ],
                "food_safety_reminders": [
                    "Reheat stored leftovers to 74°C (165°F) throughout before consuming."
                ],
                "dietary_tags": ["Vegan", "Vegetarian", "Gluten-Free", "High Fiber"],
                "image_url": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&auto=format&fit=crop"
            },
            {
                "title": "Crispy Tofu & Rainbow Vegetable Stir-Fry",
                "description": "Pan-seared extra firm tofu cubes tossed with crisp bell peppers, snap peas, and sweet garlic-ginger tamari glaze.",
                "cuisine": "Asian Fusion",
                "meal_type": "Lunch",
                "prep_time_minutes": 15,
                "cook_time_minutes": 15,
                "default_servings": 2,
                "difficulty": "Medium",
                "calories_per_serving": 340.0,
                "protein_g": 22.0,
                "carbs_g": 24.0,
                "fat_g": 18.0,
                "fiber_g": 5.5,
                "ingredients": [
                    {"name": "tofu", "amount": 400, "unit": "grams", "notes": "extra-firm, pressed"},
                    {"name": "bell pepper", "amount": 1, "unit": "item", "notes": "sliced into strips"},
                    {"name": "broccoli", "amount": 1, "unit": "cup", "notes": "bite-size florets"},
                    {"name": "soy sauce", "amount": 2, "unit": "tbsp", "notes": "tamari or coconut aminos"},
                    {"name": "sesame oil", "amount": 1, "unit": "tbsp", "notes": "toasted"},
                    {"name": "cornstarch", "amount": 1, "unit": "tbsp", "notes": "for crisping tofu"}
                ],
                "substitutions": {
                    "tofu": ["chicken breast slices", "shrimp", "seitan"],
                    "soy sauce": ["coconut aminos (soy-free)", "tamari (gluten-free)"]
                },
                "instructions": [
                    "Press tofu with heavy plate for 10 minutes, cut into 1-inch cubes, and toss with cornstarch.",
                    "Heat sesame oil in wok or heavy skillet over high heat. Fry tofu cubes until all sides are golden crisp (8 mins). Set aside.",
                    "In the same wok, stir-fry broccoli and bell pepper strips for 4-5 minutes until crisp-tender.",
                    "Pour in tamari sauce mixture and return tofu to pan. Toss quickly to coat until glossy.",
                    "Garnish with sesame seeds and serve immediately."
                ],
                "tips": [
                    "Cornstarch coating is the key to restaurant-style shatteringly crisp tofu."
                ],
                "food_safety_reminders": [
                    "Always check refrigerated tofu water package seal for leaks or swelling before opening."
                ],
                "dietary_tags": ["Vegan", "Vegetarian", "High Protein"],
                "image_url": "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop"
            },
            {
                "title": "Greek Yogurt Berry Bliss Parfait",
                "description": "Layers of rich probiotic Greek yogurt, fresh macerated strawberries, toasted almonds, and organic wildflower honey.",
                "cuisine": "European",
                "meal_type": "Breakfast",
                "prep_time_minutes": 5,
                "cook_time_minutes": 0,
                "default_servings": 1,
                "difficulty": "Easy",
                "calories_per_serving": 240.0,
                "protein_g": 18.0,
                "carbs_g": 26.0,
                "fat_g": 7.0,
                "fiber_g": 3.0,
                "ingredients": [
                    {"name": "greek yogurt", "amount": 1, "unit": "cup", "notes": "plain unsweetened 2%"},
                    {"name": "strawberries", "amount": 0.5, "unit": "cup", "notes": "sliced fresh"},
                    {"name": "almonds", "amount": 2, "unit": "tbsp", "notes": "sliced, toasted"},
                    {"name": "honey", "amount": 1, "unit": "tsp", "notes": "raw wildflower"}
                ],
                "substitutions": {
                    "greek yogurt": ["coconut yogurt (dairy-free)", "almond milk yogurt"],
                    "almonds": ["pumpkin seeds (nut-free)", "chia seeds", "sunflower seeds"]
                },
                "instructions": [
                    "Spoon half of Greek yogurt into glass parfait cup.",
                    "Add layer of sliced fresh strawberries.",
                    "Spoon remaining Greek yogurt over berries.",
                    "Top with toasted almond flakes and drizzle lightly with honey."
                ],
                "tips": [
                    "Toast almonds in dry pan for 2 minutes to bring out natural nutty aromatic oils."
                ],
                "food_safety_reminders": [
                    "Keep yogurt chilled at 1-4°C until serving."
                ],
                "dietary_tags": ["Vegetarian", "High Protein", "Quick Meal"],
                "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&auto=format&fit=crop"
            }
        ]

        created_recipes = []
        for r_item in recipes_data:
            rec = Recipe(
                title=r_item["title"],
                description=r_item["description"],
                cuisine=r_item["cuisine"],
                meal_type=r_item["meal_type"],
                prep_time_minutes=r_item["prep_time_minutes"],
                cook_time_minutes=r_item["cook_time_minutes"],
                default_servings=r_item["default_servings"],
                difficulty=r_item["difficulty"],
                calories_per_serving=r_item["calories_per_serving"],
                protein_g=r_item["protein_g"],
                carbs_g=r_item["carbs_g"],
                fat_g=r_item["fat_g"],
                fiber_g=r_item["fiber_g"],
                ingredients_json=json.dumps(r_item["ingredients"]),
                substitutions_json=json.dumps(r_item["substitutions"]),
                instructions_json=json.dumps(r_item["instructions"]),
                tips_json=json.dumps(r_item["tips"]),
                food_safety_reminders_json=json.dumps(r_item["food_safety_reminders"]),
                dietary_tags_json=json.dumps(r_item["dietary_tags"]),
                image_url=r_item["image_url"]
            )
            db.add(rec)
            created_recipes.append(rec)
        db.flush()

        # Favorite first recipe
        if created_recipes:
            fav = FavoriteRecipe(recipe_id=created_recipes[0].id, notes="Family favorite weeknight dinner")
            db.add(fav)

    # 3. Sample Food Analyses
    if db.query(FoodAnalysis).count() == 0:
        sample_food = FoodAnalysis(
            food_name="Grilled Chicken Salad",
            original_detected_name="Grilled Chicken Salad",
            confidence=0.92,
            portion_grams=350.0,
            portion_unit="grams",
            portion_description="1 large bowl (approx 350g)",
            estimated_calories=343.0,
            protein_g=40.2,
            carbs_g=14.7,
            fat_g=13.3,
            fiber_g=7.3,
            sugar_g=7.0,
            sodium_mg=980.0,
            is_user_corrected=False,
            ai_provider_used="opencv-cv-fallback",
            is_simulated_or_estimated=True,
            disclaimer_note="Image-based nutritional values are computational approximations derived from standard food tables.",
            detected_items_json=json.dumps([
                {"name": "Grilled Chicken", "confidence": 0.94, "portion_grams_estimated": 150.0},
                {"name": "Mixed Greens & Tomatoes", "confidence": 0.89, "portion_grams_estimated": 200.0}
            ])
        )
        db.add(sample_food)

    # 4. Sample Freshness Assessments
    if db.query(FreshnessAssessment).count() == 0:
        sample_fresh1 = FreshnessAssessment(
            food_category="Fruit",
            item_name="Fresh Honeycrisp Apple",
            visual_status="Appears fresh",
            confidence=0.94,
            discoloration_score=0.04,
            surface_defect_score=0.03,
            detected_visual_characteristics_json=json.dumps([
                "Uniform red-yellow pigmentation",
                "Turgid smooth skin with intact wax layer",
                "No visible bruises or localized depression"
            ]),
            explanation="Optical analysis shows tight surface tension, uniform reflectance, and negligible defect indicators (<1.5% area).",
            storage_recommendations_json=json.dumps([
                "Refrigerate in vegetable crisper drawer at 1-3°C.",
                "Keep isolated from leafy greens due to natural ethylene gas emission."
            ]),
            safety_disclaimer=(
                "SAFETY NOTICE: Visual inspection verifies appearance only. It does not certify microbiological safety. "
                "Wash thoroughly under clean running water before eating."
            ),
            ai_provider_used="opencv-cv-fallback"
        )
        sample_fresh2 = FreshnessAssessment(
            food_category="Produce",
            item_name="Baby Spinach Leaves",
            visual_status="Possible quality deterioration",
            confidence=0.82,
            discoloration_score=0.28,
            surface_defect_score=0.25,
            detected_visual_characteristics_json=json.dumps([
                "Mild edge wilting and loss of leaf turgidity",
                "Localized dampness and slight dark discoloration at leaf margins"
            ]),
            explanation="Visible edge curl and preliminary darkening indicate moisture condensation and early tissue softening.",
            storage_recommendations_json=json.dumps([
                "Remove damp leaves immediately.",
                "Place remaining dry leaves in an airtight container lined with dry paper towels; consume within 24 hours."
            ]),
            safety_disclaimer=(
                "IMPORTANT: Do not consume greens if slimy, translucent, or emitting a sour or putrid odor."
            ),
            ai_provider_used="opencv-cv-fallback"
        )
        db.add_all([sample_fresh1, sample_fresh2])

    # 5. Sample Hygiene Inspection
    if db.query(HygieneInspection).count() == 0:
        insp = HygieneInspection(
            facility_name="Main Commercial Kitchen Station 1",
            inspector_name="Lead Sanitation Auditor",
            inspection_type="Hybrid Inspection",
            overall_score=94.0,
            status="Passed",
            detected_observations_json=json.dumps([
                "Food-contact stainless steel surfaces clear and sanitized.",
                "Sanitizer bucket test strip recorded within required 200-400 ppm quat range.",
                "Handwashing sink fully accessible with paper towels and antibacterial soap."
            ]),
            unresolved_observations_json=json.dumps([
                "Minor condensation noted on secondary walk-in refrigerator threshold gasket."
            ]),
            corrective_actions_json=json.dumps([
                "Wipe and inspect walk-in cooler door gasket; schedule seal replacement if condensation recurs."
            ]),
            safety_disclaimer=(
                "Visual and checklist inspection records observable cleanliness indicators and does not substitute for regulatory health authority audits."
            )
        )
        db.add(insp)
        db.flush()

        checklist_items = [
            ("prep_clean", "Sanitation", "Preparation surface cleanliness", "Stainless steel tables sanitized with approved agent.", "Passed"),
            ("storage_org", "Storage", "Food storage organization", "All food containers labeled, dated, and stored 6 inches above floor.", "Passed"),
            ("raw_rte_sep", "Cross-Contamination", "Separation of raw and ready-to-eat foods", "Raw poultry stored on bottom shelf below ready-to-eat produce.", "Passed"),
            ("waste_accum", "Waste Management", "Visible waste accumulation", "Trash receptacles covered, lined, and emptied prior to overflow.", "Passed"),
            ("handwash", "Personnel Hygiene", "Handwashing facilities operational", "Dedicated handwash station stocked with hot water, soap, and single-use towels.", "Passed"),
            ("clean_schedule", "Documentation", "Cleaning schedule completion", "Daily sanitation log signed and up to date.", "Passed"),
            ("temp_logs", "HACCP", "Temperature log completion", "Refrigerators logged at 2.8°C; hot hold logged at 65.5°C.", "Passed"),
            ("pest_control", "Pest Management", "Pest-control inspection records", "Monthly certified pest control vendor report verified.", "Passed"),
        ]

        for key, cat, title, desc, stat in checklist_items:
            item = HygieneChecklistItem(
                inspection_id=insp.id,
                item_key=key,
                category=cat,
                title=title,
                description=desc,
                status=stat,
                notes="Verified during morning audit cycle."
            )
            db.add(item)

    # 6. Sample Meal Plan & Shopping List
    if db.query(MealPlan).count() == 0 and db.query(Recipe).count() > 0:
        from backend.app.services.meal_planner_service import MealPlannerService
        plan = MealPlannerService.generate_plan(db, profile=profile, plan_type="weekly", title="Weekly Balanced Nutrition Plan")
        MealPlannerService.generate_shopping_list(db, plan.id)

    db.commit()

