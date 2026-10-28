from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database import get_db
from backend.app.core.config import settings
from backend.app.models.models import HygieneInspection, HygieneChecklistItem
from backend.app.schemas.schemas import (
    HygieneInspectionCreate, HygieneInspectionResponse, HygieneSummaryResponse
)
from backend.app.ai.multimodal_provider import ai_vision_provider

router = APIRouter(prefix="/hygiene", tags=["Restaurant Hygiene & Food Safety Monitoring"])


@router.post("/analyze")
async def analyze_kitchen_image(
    file: UploadFile = File(...)
):
    if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported image format '{file.content_type}'. Supported formats: JPEG, PNG, WebP."
        )

    timestamp = int(datetime.now(timezone.utc).timestamp())
    safe_filename = f"hygiene_{timestamp}_{file.filename}"
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

        result = await ai_vision_provider.analyze_hygiene(file_path)
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
            detail=f"Hygiene image scan failed: {str(e)}"
        )


@router.post("/inspections", response_model=HygieneInspectionResponse)
def create_hygiene_inspection(
    req: HygieneInspectionCreate,
    db: Session = Depends(get_db)
):
    # Compute score and status based on checklist items
    passed_count = sum(1 for item in req.checklist_items if item.status == "Passed")
    needs_attention = [item for item in req.checklist_items if item.status == "Needs Attention"]
    total_evaluated = sum(1 for item in req.checklist_items if item.status != "Not Inspected")
    
    score = round((passed_count / max(1, total_evaluated)) * 100.0, 1) if total_evaluated > 0 else 100.0
    
    if score >= 85 and len(needs_attention) <= 1:
        inspection_status = "Passed"
    elif score >= 70:
        inspection_status = "Needs Attention"
    else:
        inspection_status = "Critical Action Required"

    unresolved_obs = [f"{item.title}: {item.notes or 'Requires corrective action'}" for item in needs_attention]
    corrective_actions = [
        f"Correct '{item.title}': review sanitation protocol and reverify within 24 hours."
        for item in needs_attention
    ]
    if not corrective_actions:
        corrective_actions.append("All audited items conform to baseline food safety protocols. Continue scheduled maintenance.")

    inspection = HygieneInspection(
        image_filename=req.image_filename,
        image_url=f"/uploads/{req.image_filename}" if req.image_filename else None,
        facility_name=req.facility_name,
        inspector_name=req.inspector_name,
        inspection_type=req.inspection_type,
        overall_score=score,
        status=inspection_status,
        detected_observations=[f"Evaluated {len(req.checklist_items)} standard hygiene checkpoints."],
        unresolved_observations=unresolved_obs,
        corrective_actions=corrective_actions,
    )
    db.add(inspection)
    db.flush()

    for item in req.checklist_items:
        check_model = HygieneChecklistItem(
            inspection_id=inspection.id,
            item_key=item.item_key,
            category=item.category,
            title=item.title,
            description=item.description,
            status=item.status,
            notes=item.notes or ""
        )
        db.add(check_model)

    db.commit()
    db.refresh(inspection)
    return inspection


@router.get("/inspections", response_model=List[HygieneInspectionResponse])
def get_hygiene_inspections(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    return (
        db.query(HygieneInspection)
        .order_by(HygieneInspection.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )


@router.get("/inspections/{inspection_id}", response_model=HygieneInspectionResponse)
def get_hygiene_inspection(inspection_id: int, db: Session = Depends(get_db)):
    inspection = db.query(HygieneInspection).filter(HygieneInspection.id == inspection_id).first()
    if not inspection:
        raise HTTPException(status_code=404, detail="Hygiene inspection record not found")
    return inspection


@router.get("/summary", response_model=HygieneSummaryResponse)
def get_hygiene_summary(db: Session = Depends(get_db)):
    inspections = db.query(HygieneInspection).all()
    total = len(inspections)
    passed = sum(1 for i in inspections if i.status == "Passed")
    attention = sum(1 for i in inspections if i.status in ("Needs Attention", "Critical Action Required"))
    avg_score = round(sum(i.overall_score for i in inspections) / max(1, total), 1)

    recent_unresolved = []
    for insp in sorted(inspections, key=lambda x: x.created_at, reverse=True)[:5]:
        recent_unresolved.extend(insp.unresolved_observations)

    return {
        "total_inspections": total,
        "passed_inspections": passed,
        "needs_attention_count": attention,
        "average_hygiene_score": avg_score,
        "recent_unresolved_issues": recent_unresolved[:8],
    }

