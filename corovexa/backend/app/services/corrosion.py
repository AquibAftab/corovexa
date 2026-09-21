"""
Corrosion and threshold evaluation service.
Evaluates sensor readings against configured thresholds
to detect abnormal conditions and build pipeline views.
"""

from typing import Optional

from .data_processor import DataProcessor, NOMINAL_THICKNESS_MM


# Location mapping for known sensor nodes
NODE_LOCATIONS: dict[str, str] = {
    "N01": "Blast Furnace Feed",
    "N02": "Cooling Tower Loop",
    "N03": "Steam Distribution Header",
    "N04": "Chemical Processing Line",
}

# We will dynamically generate SENSOR_DEFINITIONS per node using get_sensor_definitions_for_node


def get_node_location(node_id: str) -> str:
    """Return the physical location for a node ID."""
    return NODE_LOCATIONS.get(node_id, f"Sector {node_id}")

def get_sensor_definitions_for_node(node_id: str, dp: DataProcessor) -> list[dict]:
    """Dynamically construct sensor definitions and thresholds based on parsed metadata."""
    meta = dp.get_node_metadata(node_id)
    
    # Defaults in case metadata is missing
    thk_w = meta.get("Thickness Warning") or (NOMINAL_THICKNESS_MM - 5.0)
    thk_c = meta.get("Thickness Critical") or (NOMINAL_THICKNESS_MM - 10.0)
    
    tmp_c = meta.get("Temperature") or 100.0
    vib_c = meta.get("Vibration") or 1.0
    mst_c = meta.get("Moisture") or 60.0
    prs_c = meta.get("Pressure") or 1000.0

    return [
        {
            "suffix": "THK",
            "metric": "Wall Thinning",
            "csv_col": "thickness_mm",
            "unit": "mm",
            "invert": True,  # value = NOMINAL - raw
            "nominal": NOMINAL_THICKNESS_MM,
            "warningMax": round(NOMINAL_THICKNESS_MM - thk_w, 2),
            "criticalMax": round(NOMINAL_THICKNESS_MM - thk_c, 2),
        },
        {
            "suffix": "TMP",
            "metric": "Temperature",
            "csv_col": "temperature_c",
            "unit": "\u00b0C",
            "invert": False,
            "warningMax": round(tmp_c * 0.9, 2),
            "criticalMax": float(tmp_c),
        },
        {
            "suffix": "PRS",
            "metric": "Pressure Drop",
            "csv_col": "air_pressure_hpa",
            "unit": "hPa",
            "invert": True, # Pressure drops are bad (< 1005). So we invert to measure "Drop"
            "nominal": 1025.0, # Assumed nominal high pressure
            "warningMax": round(1025.0 - (prs_c + 5.0), 2),
            "criticalMax": round(1025.0 - prs_c, 2),
        },
        {
            "suffix": "MST",
            "metric": "Moisture",
            "csv_col": "moisture_percent",
            "unit": "%",
            "invert": False,
            "warningMax": round(mst_c * 0.9, 2),
            "criticalMax": float(mst_c),
        },
        {
            "suffix": "VIB",
            "metric": "Vibration",
            "csv_col": "vibration_mps2",
            "unit": "m/s\u00b2",
            "invert": False,
            "warningMax": round(vib_c * 0.8, 2),
            "criticalMax": float(vib_c),
        },
    ]


def _transform_value(raw: float, sensor_def: dict) -> float:
    """Apply value transformation (e.g. wall thinning or pressure drop inversion)."""
    if sensor_def["invert"]:
        return round(sensor_def["nominal"] - raw, 2)
    return round(raw, 2)


def _evaluate_status(value: float, warning_max: float, critical_max: float) -> str:
    """Evaluate a sensor value against thresholds."""
    if value >= critical_max:
        return "Critical"
    if value >= warning_max:
        return "Warning"
    return "Active"


def build_pipeline_data(data_processor: Optional[DataProcessor] = None) -> list[dict]:
    """
    Build the pipeline -> sensors hierarchy expected by the React frontend.

    Each unique node_id in the CSV becomes a pipeline.
    Each measurement column becomes a virtual sensor with its latest value.
    """
    dp = data_processor or DataProcessor.get_instance()
    node_ids = dp.get_node_ids()
    pipelines: list[dict] = []

    for node_id in node_ids:
        node_data = dp.df[dp.df["node_id"] == node_id]
        latest = node_data.sort_values("timestamp").iloc[-1]

        sensors: list[dict] = []
        has_critical = False
        has_warning = False

        sensor_defs = get_sensor_definitions_for_node(node_id, dp)

        for sdef in sensor_defs:
            raw_value = float(latest[sdef["csv_col"]])
            display_value = _transform_value(raw_value, sdef)
            status = _evaluate_status(display_value, sdef["warningMax"], sdef["criticalMax"])

            if status == "Critical":
                has_critical = True
            elif status == "Warning":
                has_warning = True

            sensors.append({
                "sensorId": f"{node_id}-{sdef['suffix']}",
                "metric": sdef["metric"],
                "currentValue": display_value,
                "unit": sdef["unit"],
                "thresholds": {
                    "warningMax": sdef["warningMax"],
                    "criticalMax": sdef["criticalMax"],
                },
                "status": status,
            })

        pipeline_status = (
            "Critical" if has_critical
            else "Warning" if has_warning
            else "Healthy"
        )

        pipelines.append({
            "pipelineId": node_id,
            "location": get_node_location(node_id),
            "pipelineStatus": pipeline_status,
            "sensors": sensors,
        })

    return pipelines


def evaluate_alerts(data_processor: Optional[DataProcessor] = None) -> list[dict]:
    """
    Evaluate latest sensor readings against thresholds.
    Returns alert objects for any sensor in Warning or Critical state.
    """
    dp = data_processor or DataProcessor.get_instance()
    node_ids = dp.get_node_ids()
    alerts: list[dict] = []
    alert_id = 1

    for node_id in node_ids:
        node_data = dp.df[dp.df["node_id"] == node_id]
        latest = node_data.sort_values("timestamp").iloc[-1]
        timestamp = str(latest["timestamp"])
        
        sensor_defs = get_sensor_definitions_for_node(node_id, dp)

        for sdef in sensor_defs:
            raw_value = float(latest[sdef["csv_col"]])
            display_value = _transform_value(raw_value, sdef)
            status = _evaluate_status(display_value, sdef["warningMax"], sdef["criticalMax"])

            if status in ("Warning", "Critical"):
                condition = f"{sdef['metric']} at {display_value} {sdef['unit']}"
                if status == "Critical":
                    if display_value > sdef['criticalMax']:
                        condition += f" (exceeds critical threshold {sdef['criticalMax']} {sdef['unit']})"
                    else:
                        condition += f" (reaches critical threshold {sdef['criticalMax']} {sdef['unit']})"
                    impact = f"{sdef['metric']} breach may require immediate intervention"
                else:
                    if display_value > sdef['warningMax']:
                        condition += f" (exceeds warning threshold {sdef['warningMax']} {sdef['unit']})"
                    else:
                        condition += f" (reaches warning threshold {sdef['warningMax']} {sdef['unit']})"
                    impact = f"{sdef['metric']} approaching critical levels"

                alerts.append({
                    "id": alert_id,
                    "timestamp": timestamp,
                    "pipelineId": node_id,
                    "sensorId": f"{node_id}-{sdef['suffix']}",
                    "severity": status,
                    "condition": condition,
                    "operationalImpact": impact,
                    "isAcknowledged": False,
                })
                alert_id += 1

    return alerts
