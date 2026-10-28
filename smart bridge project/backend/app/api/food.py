import os
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.core.config import settings
from backend.app.models.models import FoodAnalysis, NutritionRecord, UserProfile
from backend.app.schemas.schemas import (
    FoodAnalysisResponse, FoodAnalysisSaveRequest, FoodRecalculateRequest, DailyNutritionSummary
)
from backend.app.ai.multimodal_provider import ai_vision_provider
from backend.app.services.nutrition_db import find_nutrition_data, calculate_nutrition_for_grams

router = APIRouter(prefix="/food", tags=["Food Recognition & Nutrition"])


@router.post("/analyze", response_model=FoodAnalysisResponse)
async def analyze_food_image(
    file: UploadFile = File(...),
    food_hint: Optional[str] = Form(None)
):
    # Validate content type
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{file.content_type}'. Supported formats: JPEG, PNG, WebP."
        )

    # Check file size & save temporarily
    timestamp = int(datetime.now(timezone.utc).timestamp())
    safe_filename = f"food_{timestamp}_{file.filename}"
    file_path = settings.UPLOAD_DIR / safe_filename

    try:
        content = await file.read()
        if len(content) > settings.MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed upload size of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
            )

        with open(file_path, "wb") as buffer:
            buffer.write(content)

        # Run AI/CV analysis
        result = await ai_vision_provider.analyze_food(file_path, filename_hint=food_hint or file.filename)
        result["image_filename"] = safe_filename
        result["image_url"] = f"/uploads/{safe_filename}"
        return result

    except HTTPException:
        raise
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image analysis failed: {str(e)}"
        )


@router.post("/recalculate")
def recalculate_nutrition(req: FoodRecalculateRequest):
    """Calculates updated nutritional values when the user modifies portion size or food item."""
    nutr_data = find_nutrition_data(req.food_name)
    scaled = calculate_nutrition_for_grams(nutr_data, req.portion_grams)
    return {
        "food_name": req.food_name,
        "portion_grams": req.portion_grams,
        "portion_unit": req.portion_unit,
        "portion_description": f"Adjusted portion ({req.portion_grams}g)",
        **scaled
    }


@router.post("/save", response_model=FoodAnalysisResponse)
def save_food_analysis(req: FoodAnalysisSaveRequest, db: Session = Depends(get_db)):
    """Persists food analysis to history and logs a daily nutrition record."""
    analysis = FoodAnalysis(
        image_filename=req.image_filename,
        image_url=f"/uploads/{req.image_filename}" if req.image_filename else None,
        food_name=req.food_name,
        original_detected_name=req.original_detected_name or req.food_name,
        confidence=req.confidence,
        portion_grams=req.portion_grams,
        portion_unit=req.portion_unit,
        portion_description=req.portion_description,
        estimated_calories=req.estimated_calories,
        protein_g=req.protein_g,
        carbs_g=req.carbs_g,
        fat_g=req.fat_g,
        fiber_g=req.fiber_g,
        sugar_g=req.sugar_g,
        sodium_mg=req.sodium_mg,
        is_user_corrected=req.is_user_corrected,
        ai_provider_used=req.ai_provider_used,
        is_simulated_or_estimated=True,
        detected_items=req.detected_items
    )
    db.add(analysis)
    db.flush()

    # Also log to NutritionRecord for today
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    record = NutritionRecord(
        food_analysis_id=analysis.id,
        meal_type="meal",
        date_str=today_str,
        food_name=analysis.food_name,
        calories=analysis.estimated_calories,
        protein_g=analysis.protein_g,
        carbs_g=analysis.carbs_g,
        fat_g=analysis.fat_g,
        fiber_g=analysis.fiber_g,
        sugar_g=analysis.sugar_g,
        sodium_mg=analysis.sodium_mg,
    )
    db.add(record)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/history", response_model=List[FoodAnalysisResponse])
def get_food_analysis_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(FoodAnalysis)
        .order_by(FoodAnalysis.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/daily-summary", response_model=DailyNutritionSummary)
def get_daily_nutrition_summary(date_str: Optional[str] = None, db: Session = Depends(get_db)):
    target_date = date_str or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    records = db.query(NutritionRecord).filter(NutritionRecord.date_str == target_date).all()
    
    profile = db.query(UserProfile).first()
    calorie_target = profile.calorie_target if profile else 2000

    total_cals = sum(r.calories for r in records)
    total_prot = sum(r.protein_g for r in records)
    total_carbs = sum(r.carbs_g for r in records)
    total_fat = sum(r.fat_g for r in records)
    total_fiber = sum(r.fiber_g for r in records)
    total_sodium = sum(r.sodium_mg for r in records)

    return {
        "date": target_date,
        "total_calories": round(total_cals, 1),
        "total_protein_g": round(total_prot, 1),
        "total_carbs_g": round(total_carbs, 1),
        "total_fat_g": round(total_fat, 1),
        "total_fiber_g": round(total_fiber, 1),
        "total_sodium_mg": round(total_sodium, 1),
        "calorie_target": calorie_target,
        "analyses_count": len(records),
    }


@router.get("/{analysis_id}", response_model=FoodAnalysisResponse)
def get_food_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(FoodAnalysis).filter(FoodAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Food analysis not found")
    return analysis


@router.delete("/{analysis_id}")
def delete_food_analysis(analysis_id: int, db: Session = Depends(get_db)):
    analysis = db.query(FoodAnalysis).filter(FoodAnalysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Food analysis not found")
    
    # Remove image file if exists
    if analysis.image_filename:
        p = settings.UPLOAD_DIR / analysis.image_filename
        if p.exists():
            p.unlink()

    db.delete(analysis)
    db.commit()
    return {"message": "Food analysis deleted successfully"}

