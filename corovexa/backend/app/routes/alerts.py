"""Alert routes for COROVEXA API."""

from fastapi import APIRouter, HTTPException, status, Depends
from ..models.schemas import AlertsResponse, AcknowledgeRequest
from ..services.corrosion import evaluate_alerts
from ..api.deps import get_current_active_user

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])

# In-memory store for alert acknowledgment state.
# Future: Persist in DynamoDB or MongoDB.
_acknowledged_alerts: dict[int, dict] = {}


@router.get("", dependencies=[Depends(get_current_active_user)])
def get_alerts() -> dict:
    """
    Evaluate current sensor readings against thresholds.
    Returns alerts for any sensor in Warning or Critical state.
    """
    alerts = evaluate_alerts()

    # Apply any in-memory acknowledgments
    for alert in alerts:
        ack = _acknowledged_alerts.get(alert["id"])
        if ack:
            alert["isAcknowledged"] = True
            alert["acknowledgedBy"] = ack["userName"]

    return {
        "alerts": alerts,
        "count": len(alerts),
        "unacknowledged": sum(1 for a in alerts if not a["isAcknowledged"]),
    }


@router.post("/{alert_id}/acknowledge", dependencies=[Depends(get_current_active_user)])
def acknowledge_alert(alert_id: int, body: AcknowledgeRequest) -> dict:
    """
    Mark an alert as acknowledged by a user.
    """
    _acknowledged_alerts[alert_id] = {"userName": body.userName}
    return {
        "message": f"Alert {alert_id} acknowledged by {body.userName}",
        "alert_id": alert_id,
    }
