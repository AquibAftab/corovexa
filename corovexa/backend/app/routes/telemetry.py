"""Telemetry data routes for COROVEXA API."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi import status
from ..models.schemas import TelemetryResponse, NodeTelemetryResponse
from ..services.data_processor import DataProcessor
from ..services.s3_service import check_s3_connection
from ..api.deps import get_current_active_user, role_required

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])


# ---------------------------------------------------------------------------
# Health / connectivity check  (must be ABOVE /{node_id} to avoid clash)
# ---------------------------------------------------------------------------

@router.get("/health")
def telemetry_health() -> dict:
    """
    Verify that FastAPI is running, S3 configuration exists,
    and the S3 bucket can be reached.

    Does NOT expose any credentials.
    """
    result = check_s3_connection()
    status_code = 200 if result["status"] == "ok" else 503
    if status_code != 200:
        raise HTTPException(status_code=status_code, detail=result)
    return result


# ---------------------------------------------------------------------------
# Telemetry CRUD  (existing — unchanged)
# ---------------------------------------------------------------------------

@router.get("", dependencies=[Depends(get_current_active_user)])
def get_all_telemetry() -> dict:
    """
    Return all telemetry readings fetched from S3.
    Fields are mapped to API names (thickness_mm -> thickness, etc.).
    """
    dp = DataProcessor.get_instance()
    data = dp.get_all_telemetry()
    return {
        "data": data,
        "count": len(data),
        "nodes": dp.get_node_ids(),
    }


@router.get("/latest")
def get_latest_telemetry() -> dict:
    """
    Return only the most recent reading per node.
    """
    dp = DataProcessor.get_instance()
    return dp.get_latest_readings()


@router.get("/{node_id}", dependencies=[Depends(get_current_active_user)])
def get_node_telemetry(node_id: str) -> dict:
    """
    Return all telemetry readings for a specific node.
    """
    dp = DataProcessor.get_instance()
    data = dp.get_telemetry_by_node(node_id)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Node '{node_id}' not found in dataset",
        )
    return {
        "node_id": node_id,
        "data": data,
        "count": len(data),
    }
