from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.models import UserProfile
from backend.app.schemas.schemas import (
    UserProfileResponse, UserProfileCreate, UserProfileUpdate
)

router = APIRouter(prefix="/profile", tags=["User Profile & Dietary Preferences"])


@router.get("", response_model=UserProfileResponse)
def get_user_profile(db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        # Create default if non-existent
        profile = UserProfile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.post("", response_model=UserProfileResponse)
def create_user_profile(req: UserProfileCreate, db: Session = Depends(get_db)):
    existing = db.query(UserProfile).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists. Use PUT /api/profile to update.")

    profile = UserProfile(
        name=req.name,
        email=req.email,
        dietary_preference=req.dietary_preference,
        allergies=req.allergies,
        ingredient_exclusions=req.ingredient_exclusions,
        calorie_target=req.calorie_target,
        protein_target_g=req.protein_target_g,
        carb_target_g=req.carb_target_g,
        fat_target_g=req.fat_target_g,
        cooking_time_preference_mins=req.cooking_time_preference_mins,
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


@router.put("", response_model=UserProfileResponse)
def update_user_profile(req: UserProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(UserProfile).first()
    if not profile:
        profile = UserProfile()
        db.add(profile)

    update_data = req.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "allergies":
            profile.allergies = value
        elif field == "ingredient_exclusions":
            profile.ingredient_exclusions = value
        else:
            setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

