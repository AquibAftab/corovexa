"""Telemetry data routes for COROVEXA API."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi import status
from ..models.schemas import TelemetryResponse, NodeTelemetryResponse
from ..services.data_processor import DataProcessor
from ..api.deps import get_current_active_user, role_required

router = APIRouter(prefix="/api/telemetry", tags=["Telemetry"])


@router.get("", dependencies=[Depends(get_current_active_user)])
def get_all_telemetry() -> dict:
    """
    Return all telemetry readings from the CSV dataset.
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
