"""Work order routes for COROVEXA API."""

from fastapi import APIRouter, HTTPException, Depends
from fastapi import status
from typing import List
from datetime import datetime, timezone
import random
from pydantic import BaseModel

from ..models.schemas import CreateWorkOrderRequest, UpdateWorkOrderStatusRequest
from ..api.deps import get_current_active_user, role_required

router = APIRouter(prefix="/api/workorders", tags=["Work Orders"])

# In-memory work order store.
# Future: Persist in MongoDB.
_work_orders: list[dict] = [
    {
        "workOrderId": "WO-201",
        "targetPipeline": "NODE_01",
        "targetSensor": "NODE_01-TMP",
        "priority": "High",
        "assignedTechnician": "Marcus Torres",
        "jobStatus": "In Progress",
        "workType": "Reactive",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    },
    {
        "workOrderId": "WO-202",
        "targetPipeline": "NODE_01",
        "targetSensor": "NODE_01-VIB",
        "priority": "Low",
        "assignedTechnician": "Priya Patel",
        "jobStatus": "Open",
        "workType": "Planned",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    },
]


@router.get("", dependencies=[Depends(get_current_active_user)])
def get_work_orders() -> dict:
    """Return all work orders."""
    return {
        "jobs": _work_orders,
        "count": len(_work_orders),
    }


@router.post("", dependencies=[Depends(role_required(["Admin", "Operations Engineer"]))])
def create_work_order(request: CreateWorkOrderRequest) -> dict:
    """Create a new work order."""
    new_order = {
        "workOrderId": f"WO-{random.randint(300, 999)}",
        "targetPipeline": request.targetPipeline,
        "targetSensor": request.targetSensor,
        "priority": request.priority,
        "assignedTechnician": request.assignedTechnician,
        "jobStatus": "Open",
        "workType": request.workType,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    _work_orders.insert(0, new_order)
    return new_order


@router.patch("/{work_order_id}/status", dependencies=[Depends(get_current_active_user)])
def update_work_order_status(
    work_order_id: str,
    request: UpdateWorkOrderStatusRequest,
) -> dict:
    """Update the status of an existing work order."""
    for order in _work_orders:
        if order["workOrderId"] == work_order_id:
            order["jobStatus"] = request.status
            return order
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Work order '{work_order_id}' not found",
    )
