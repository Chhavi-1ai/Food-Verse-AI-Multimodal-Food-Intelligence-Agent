from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.core.config import settings
from backend.app.models.models import FreshnessAssessment
from backend.app.schemas.schemas import FreshnessAssessmentResponse
from backend.app.ai.multimodal_provider import ai_vision_provider

router = APIRouter(prefix="/freshness", tags=["Food Freshness & Spoilage Detection"])


@router.post("/analyze", response_model=FreshnessAssessmentResponse)
async def analyze_produce_freshness(
    file: UploadFile = File(...),
    food_hint: Optional[str] = Form(None),
    save_to_history: bool = Form(True),
    db: Session = Depends(get_db)
):
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{file.content_type}'. Supported formats: JPEG, PNG, WebP."
        )

    timestamp = int(datetime.now(timezone.utc).timestamp())
    safe_filename = f"freshness_{timestamp}_{file.filename}"
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

        # Run Freshness Inspection
        result = await ai_vision_provider.analyze_freshness(file_path, food_hint=food_hint or file.filename)
        result["image_filename"] = safe_filename
        result["image_url"] = f"/uploads/{safe_filename}"

        if save_to_history:
            assessment = FreshnessAssessment(
                image_filename=safe_filename,
                image_url=f"/uploads/{safe_filename}",
                food_category=result.get("food_category", "Produce"),
                item_name=result.get("item_name", "Produce Item"),
                visual_status=result.get("visual_status", "Appears fresh"),
                confidence=result.get("confidence", 0.85),
                discoloration_score=result.get("discoloration_score", 0.1),
                surface_defect_score=result.get("surface_defect_score", 0.1),
                detected_visual_characteristics=result.get("detected_visual_characteristics", []),
                explanation=result.get("explanation", ""),
                storage_recommendations=result.get("storage_recommendations", []),
                safety_disclaimer=result.get("safety_disclaimer", ""),
                ai_provider_used=result.get("ai_provider_used", "opencv-fallback")
            )
            db.add(assessment)
            db.commit()
            db.refresh(assessment)
            result["id"] = assessment.id
            result["created_at"] = assessment.created_at

        return result

    except HTTPException:
        raise
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Freshness analysis failed: {str(e)}"
        )


@router.get("/history", response_model=List[FreshnessAssessmentResponse])
def get_freshness_history(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(FreshnessAssessment)
        .order_by(FreshnessAssessment.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/{assessment_id}", response_model=FreshnessAssessmentResponse)
def get_freshness_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(FreshnessAssessment).filter(FreshnessAssessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Freshness assessment record not found")
    return assessment

