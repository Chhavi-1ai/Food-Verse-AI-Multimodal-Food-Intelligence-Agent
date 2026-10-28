from fastapi import APIRouter
from backend.app.api.food import router as food_router
from backend.app.api.freshness import router as freshness_router
from backend.app.api.hygiene import router as hygiene_router
from backend.app.api.recipes import router as recipes_router
from backend.app.api.meal_plans import router as meal_plans_router
from backend.app.api.profile import router as profile_router
from backend.app.api.system import router as system_router

api_router = APIRouter()
api_router.include_router(system_router)
api_router.include_router(food_router)
api_router.include_router(freshness_router)
api_router.include_router(hygiene_router)
api_router.include_router(recipes_router)
api_router.include_router(meal_plans_router)
api_router.include_router(profile_router)

