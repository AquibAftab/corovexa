"""Pydantic models for COROVEXA API request/response schemas."""

from pydantic import BaseModel, Field
from typing import Optional


# --- Telemetry ---

class TelemetryReading(BaseModel):
    """A single telemetry reading from a sensor node."""
    timestamp: str
    node_id: str
    thickness: float
    temperature: float
    pressure: float
    moisture: float
    vibration: float


class TelemetryResponse(BaseModel):
    """Response for telemetry list endpoints."""
    data: list[dict]
    count: int
    nodes: list[str]


class NodeTelemetryResponse(BaseModel):
    """Response for single-node telemetry."""
    node_id: str
    data: list[dict]
    count: int


# --- Pipeline / Sensors ---

class SensorThresholds(BaseModel):
    """Warning and critical threshold values for a sensor."""
    warningMax: float
    criticalMax: float


class SensorInfo(BaseModel):
    """Individual sensor within a pipeline."""
    sensorId: str
    metric: str
    currentValue: float
    unit: str
    thresholds: SensorThresholds
    status: str


class PipelineInfo(BaseModel):
    """Pipeline asset with attached sensors."""
    pipelineId: str
    location: str
    pipelineStatus: str
    sensors: list[SensorInfo]


class PipelineResponse(BaseModel):
    """Response for pipeline endpoint."""
    pipelines: list[PipelineInfo]
    count: int


# --- Alerts ---

class Alert(BaseModel):
    """An alert generated from threshold evaluation."""
    id: int
    timestamp: str
    pipelineId: str
    sensorId: Optional[str] = None
    severity: str
    condition: str
    operationalImpact: str
    isAcknowledged: bool = False
    acknowledgedBy: Optional[str] = None


class AcknowledgeRequest(BaseModel):
    """Request body for acknowledging an alert."""
    userName: str = "System"


class AlertsResponse(BaseModel):
    """Response for alerts endpoint."""
    alerts: list[Alert]
    count: int
    unacknowledged: int


# --- Analytics ---

class MetricStats(BaseModel):
    """Statistical summary for a single metric."""
    unit: str
    min: float
    max: float
    mean: float
    std: float
    latest: float
    first: float
    trend: str


class KPIs(BaseModel):
    """Plant-wide key performance indicators."""
    uptimePercentage: float
    onlineSensors: int
    mttr: float
    mtbf: float


class UptimeHistory(BaseModel):
    """Historical uptime data for charting."""
    days: list[str]
    values: list[float]


class TimeSeries(BaseModel):
    """Time-series data for all metrics."""
    timestamps: list[str]
    thickness: list[float]
    temperature: list[float]
    pressure: list[float]
    moisture: list[float]
    vibration: list[float]


# --- Work Orders ---

class WorkOrder(BaseModel):
    """A maintenance work order."""
    workOrderId: str
    targetPipeline: str
    targetSensor: str
    priority: str
    assignedTechnician: str
    jobStatus: str
    workType: str
    createdAt: str


class CreateWorkOrderRequest(BaseModel):
    """Request body for creating a work order."""
    targetPipeline: str
    targetSensor: str
    priority: str = "Medium"
    workType: str = "Planned"
    assignedTechnician: str


class UpdateWorkOrderStatusRequest(BaseModel):
    """Request body for updating work order status."""
    status: str


class WorkOrdersResponse(BaseModel):
    """Response for work orders endpoint."""
    jobs: list[WorkOrder]
    count: int


# --- Authentication ---

class LoginRequest(BaseModel):
    """Login credentials."""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Successful login response."""
    user: str
    role: str
    token: str
    message: str = "Login successful"


# --- Health ---

class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    service: str = "COROVEXA API"
    version: str = "1.0.0"
