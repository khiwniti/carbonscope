"""
BOQ Analysis API Router.

Exposes the BOQ parsing and carbon calculation pipeline as REST endpoints.
Integrates with the existing FastAPI application at /v1/boq/*.
"""

import logging
import tempfile
import os
from typing import Annotated, Optional
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from core.auth.auth import get_current_user
from core.config import suna_config

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/boq", tags=["BOQ Analysis"])

MAX_UPLOAD_SIZE_BYTES = 50 * 1024 * 1024  # 50 MB


# ---------------------------------------------------------------------------
# Request / Response schemas
# ---------------------------------------------------------------------------

class BOQUploadResponse(BaseModel):
    analysis_id: str
    file_id: str
    filename: str
    status: str = Field(description="queued | processing | completed | failed")
    materials_count: int
    success_rate: float
    message: str


class MaterialResult(BaseModel):
    line_number: int
    description_th: str
    description_en: Optional[str] = None
    quantity: float
    unit: str
    tgo_material: Optional[str] = None
    emission_factor: Optional[float] = None
    carbon_kgco2e: Optional[float] = None
    confidence: float = 0.0
    classification: str = "unknown"


class CarbonAnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    total_carbon_kgco2e: Optional[float] = None
    materials: list[MaterialResult] = []
    breakdown_by_category: dict = {}
    match_statistics: dict = {}
    created_at: str
    error: Optional[str] = None


class AnalysisStatusResponse(BaseModel):
    analysis_id: str
    status: str
    progress_percent: int
    message: str
    created_at: str
    completed_at: Optional[str] = None


# ---------------------------------------------------------------------------
# In-memory task store (production: use Redis or DB)
# ---------------------------------------------------------------------------

_analysis_store: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    response_model=BOQUploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload BOQ Excel file for carbon analysis",
)
async def upload_boq(
    file: Annotated[UploadFile, File(description="Thai BOQ Excel file (.xlsx or .xls)")],
    language: Annotated[str, Form()] = "th",
    user: dict = Depends(get_current_user),
):
    """
    Upload a Thai BOQ Excel file and trigger carbon analysis.

    Accepts .xlsx and .xls files up to 50 MB. Parses materials, matches
    to TGO emission factors, and returns an analysis_id for status polling.
    """
    if not file.filename or not file.filename.lower().endswith(('.xlsx', '.xls')):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Only .xlsx and .xls files are accepted.",
        )

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE_BYTES // (1024*1024)} MB.",
        )

    try:
        from boq.parser import parse_boq
        from boq.material_matching import match_boq_materials, calculate_match_statistics
    except ImportError as exc:
        logger.error("BOQ module import failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="BOQ analysis service is not available.",
        ) from exc

    # Write to temp file for parser
    suffix = ".xlsx" if file.filename.endswith('.xlsx') else ".xls"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    try:
        parse_result = parse_boq(tmp_path)
    except Exception as exc:
        logger.error("BOQ parse error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to parse BOQ file: {exc}",
        ) from exc
    finally:
        os.unlink(tmp_path)

    import uuid
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # Match materials (best-effort; may not have GraphDB)
    try:
        matches = match_boq_materials(parse_result.materials, graphdb_client=None)
        stats = calculate_match_statistics(matches)
    except Exception as exc:
        logger.warning("Material matching skipped: %s", exc)
        matches = []
        stats = {"total": len(parse_result.materials), "matched": 0, "match_rate": 0.0}

    # Build material results with TGO carbon calculation (fallback lookup)
    from boq.tgo_lookup import calculate_material_carbon
    from decimal import Decimal as D

    material_results = []
    total_carbon = D("0")
    breakdown: dict[str, float] = {}

    for i, mat in enumerate(parse_result.materials):
        match = matches[i] if i < len(matches) else None

        # Try TGO fallback calculation
        calc = calculate_material_carbon(mat.description_th, mat.quantity, mat.unit)
        if calc is None and mat.description_en:
            calc = calculate_material_carbon(mat.description_en, mat.quantity, mat.unit)

        carbon_val = None
        ef_val = None
        tgo_name = None
        confidence = 0.0
        classification = "unmatched"

        if calc:
            carbon_val = calc["carbon_kgco2e"]
            ef_val = calc["emission_factor"]
            tgo_name = calc["matched_material_en"]
            confidence = 0.85
            classification = "auto_match"
            total_carbon += D(str(carbon_val))
            # Aggregate by material category (first word of name)
            cat = calc["material_id"].split("_")[0].capitalize()
            breakdown[cat] = breakdown.get(cat, 0.0) + carbon_val
        elif match and match.tgo_match:
            tgo_name = match.tgo_match.get("name")
            ef_val = match.tgo_match.get("emission_factor")
            confidence = match.confidence
            classification = match.classification

        material_results.append(MaterialResult(
            line_number=mat.line_number,
            description_th=mat.description_th,
            description_en=mat.description_en,
            quantity=float(mat.quantity),
            unit=mat.unit,
            tgo_material=tgo_name,
            emission_factor=ef_val,
            carbon_kgco2e=carbon_val,
            confidence=confidence,
            classification=classification,
        ))

    matched_count = sum(1 for m in material_results if m.classification == "auto_match")
    stats = {
        "total": len(material_results),
        "matched": matched_count,
        "match_rate": round(matched_count / len(material_results) * 100, 1) if material_results else 0.0,
        "data_source": "TGO_FALLBACK",
    }

    total_carbon_val = float(total_carbon) if total_carbon > 0 else None

    _analysis_store[analysis_id] = {
        "analysis_id": analysis_id,
        "file_id": parse_result.file_id,
        "filename": file.filename,
        "status": "completed",
        "user_id": user["user_id"],
        "language": language,
        "materials": [m.model_dump() for m in material_results],
        "match_statistics": stats,
        "breakdown_by_category": breakdown,
        "total_carbon_kgco2e": total_carbon_val,
        "created_at": now,
        "completed_at": now,
        "parse_metadata": parse_result.metadata,
        "parse_errors": [e if isinstance(e, dict) else e.model_dump() for e in parse_result.errors],
    }

    return BOQUploadResponse(
        analysis_id=analysis_id,
        file_id=parse_result.file_id,
        filename=file.filename,
        status="completed",
        materials_count=len(parse_result.materials),
        success_rate=parse_result.metadata.get("success_rate", 0.0),
        message=f"Parsed {len(parse_result.materials)} materials. Carbon: {total_carbon_val:.0f} kgCO₂e" if total_carbon_val else f"Parsed {len(parse_result.materials)} materials.",
    )


@router.get(
    "/{analysis_id}",
    response_model=CarbonAnalysisResponse,
    summary="Get BOQ analysis results",
)
async def get_analysis(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Retrieve carbon analysis results by analysis_id."""
    record = _analysis_store.get(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    if record.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    return CarbonAnalysisResponse(
        analysis_id=record["analysis_id"],
        status=record["status"],
        total_carbon_kgco2e=record.get("total_carbon_kgco2e"),
        materials=[MaterialResult(**m) for m in record["materials"]],
        breakdown_by_category=record.get("breakdown_by_category", {}),
        match_statistics=record.get("match_statistics", {}),
        created_at=record["created_at"],
        error=record.get("error"),
    )


@router.get(
    "/{analysis_id}/status",
    response_model=AnalysisStatusResponse,
    summary="Poll analysis status",
)
async def get_analysis_status(
    analysis_id: str,
    user: dict = Depends(get_current_user),
):
    """Poll the status of an ongoing analysis."""
    record = _analysis_store.get(analysis_id)
    if not record:
        raise HTTPException(status_code=404, detail="Analysis not found.")

    if record.get("user_id") != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied.")

    status_map = {"queued": 0, "processing": 50, "completed": 100, "failed": 0}
    return AnalysisStatusResponse(
        analysis_id=analysis_id,
        status=record["status"],
        progress_percent=status_map.get(record["status"], 0),
        message=f"Analysis {record['status']}.",
        created_at=record["created_at"],
        completed_at=record.get("completed_at"),
    )


@router.get(
    "/",
    summary="List recent analyses for the current user",
)
async def list_analyses(
    user: dict = Depends(get_current_user),
    limit: int = 20,
):
    """Return the most recent analyses for the authenticated user."""
    user_analyses = [
        {
            "analysis_id": r["analysis_id"],
            "filename": r["filename"],
            "status": r["status"],
            "materials_count": len(r["materials"]),
            "created_at": r["created_at"],
        }
        for r in _analysis_store.values()
        if r.get("user_id") == user["user_id"]
    ]
    user_analyses.sort(key=lambda x: x["created_at"], reverse=True)
    return {"analyses": user_analyses[:limit]}
