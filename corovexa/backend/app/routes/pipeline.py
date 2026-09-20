"""Pipeline monitoring routes for COROVEXA API."""

from fastapi import APIRouter, Depends
from ..models.schemas import PipelineResponse
from ..services.corrosion import build_pipeline_data
from ..api.deps import get_current_active_user

router = APIRouter(prefix="/api/pipeline", tags=["Pipeline"])


@router.get("", dependencies=[Depends(get_current_active_user)])
def get_pipelines() -> dict:
    """
    Return pipeline assets with attached sensor data.

    Transforms flat CSV rows into the pipeline -> sensors hierarchy
    expected by the React frontend.
    """
    pipelines = build_pipeline_data()
    return {
        "pipelines": pipelines,
        "count": len(pipelines),
    }
