"""
Notification service placeholder for COROVEXA.

Future integration:
  - Amazon SNS for push notifications
  - Email alerts via SES
  - SMS notifications

Currently provides a clean interface with local logging.
"""

from typing import Optional
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Placeholder notification service.

    Methods mirror the future SNS-based implementation so that
    swapping in real notifications requires no API changes.
    """

    def __init__(self) -> None:
        self._enabled = False  # Will be True when SNS is configured
        logger.info("NotificationService initialized (local mode - no SNS)")

    def send_alert_notification(
        self,
        alert_id: int,
        severity: str,
        condition: str,
        pipeline_id: str,
        recipients: Optional[list[str]] = None,
    ) -> bool:
        """
        Send an alert notification.

        Future: Publishes to SNS topic.
        Current: Logs locally.
        """
        logger.info(
            "[NOTIFICATION] Alert #%d | %s | %s | Pipeline: %s | Recipients: %s",
            alert_id, severity, condition, pipeline_id,
            recipients or ["all"]
        )
        return True

    def send_work_order_notification(
        self,
        work_order_id: str,
        technician: str,
        priority: str,
    ) -> bool:
        """
        Notify a technician about a new work order assignment.

        Future: SNS + email via SES.
        Current: Logs locally.
        """
        logger.info(
            "[NOTIFICATION] Work Order %s assigned to %s (Priority: %s)",
            work_order_id, technician, priority
        )
        return True
