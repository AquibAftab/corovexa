"""
Data processor service for COROVEXA telemetry data.
Loads telemetry from Amazon S3 via s3_service and processes it
into a Pandas DataFrame for analysis.

The internal DataFrame uses the same column names as the original CSV
(thickness_mm, temperature_c, etc.) so that corrosion.py works unchanged.
The CSV_TO_API_MAPPING dict translates internal names → API response names.
"""

import logging
from typing import Optional

import pandas as pd

from .s3_service import fetch_telemetry_records

logger = logging.getLogger(__name__)

# -----------------------------------------------------------------------
# Field name mapping: internal column names → API field names
# Kept identical to the original so every downstream consumer is unchanged.
# -----------------------------------------------------------------------
CSV_TO_API_MAPPING: dict[str, str] = {
    "timestamp": "timestamp",
    "node_id": "node_id",
    "thickness_mm": "thickness",
    "temperature_c": "temperature",
    "air_pressure_hpa": "pressure",
    "moisture_percent": "moisture",
    "vibration_mps2": "vibration",
}

# S3 JSON field → internal DataFrame column name
_S3_TO_INTERNAL: dict[str, str] = {
    "node_id": "node_id",
    "timestamp": "timestamp",
    "thickness": "thickness_mm",
    "temperature": "temperature_c",
    "pressure": "air_pressure_hpa",
    "moisture": "moisture_percent",
    "vibration": "vibration_mps2",
}

# Nominal wall thickness for thinning calculations
NOMINAL_THICKNESS_MM: float = 105.0


class DataProcessor:
    """Service for loading and processing telemetry data from S3.

    Singleton pattern ensures data is loaded once and cached in memory.
    Call reload() to refresh data from S3.
    """

    _instance: Optional["DataProcessor"] = None
    _df: Optional[pd.DataFrame] = None
    _node_metadata: dict = {}

    def __init__(self) -> None:
        self._load_data()

    @classmethod
    def get_instance(cls) -> "DataProcessor":
        """Return the singleton DataProcessor instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Data Loading — from S3
    # ------------------------------------------------------------------

    def _load_data(self) -> None:
        """Fetch telemetry records from S3 and build the internal DataFrame."""
        logger.info("Loading telemetry data from S3 …")

        raw_records = fetch_telemetry_records()

        if not raw_records:
            logger.warning("No telemetry records returned from S3 — DataFrame will be empty")
            self._df = pd.DataFrame(columns=list(_S3_TO_INTERNAL.values()))
            self._node_metadata = {}
            return

        # Build DataFrame from list of dicts, then rename to internal columns
        df = pd.DataFrame(raw_records)
        df = df.rename(columns=_S3_TO_INTERNAL)

        # Convert timestamp
        df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

        # Ensure correct numeric types
        for col in [
            "thickness_mm",
            "temperature_c",
            "air_pressure_hpa",
            "moisture_percent",
            "vibration_mps2",
        ]:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Drop rows with missing critical fields
        df = df.dropna(subset=["node_id", "timestamp"])

        # Sort chronologically
        df = df.sort_values("timestamp").reset_index(drop=True)

        self._df = df

        # S3 JSON doesn't contain per-node metadata (PipeType, thresholds).
        # corrosion.py already handles missing metadata with sensible defaults.
        self._node_metadata = {}

        logger.info(
            "Loaded %d records for %d nodes from S3",
            len(self._df),
            self._df["node_id"].nunique(),
        )

    def reload(self) -> None:
        """Reload data from S3 (useful to pick up newly published records)."""
        self._load_data()

    def get_node_metadata(self, node_id: str) -> dict:
        """Return the extracted metadata and thresholds for a given node."""
        return self._node_metadata.get(node_id, {})

    @property
    def df(self) -> pd.DataFrame:
        """Access the loaded DataFrame."""
        if self._df is None:
            self._load_data()
        return self._df

    # ------------------------------------------------------------------
    # Query Methods  (unchanged from original)
    # ------------------------------------------------------------------

    def get_all_telemetry(self) -> list[dict]:
        """Return all telemetry rows with API field names."""
        result = self.df.rename(columns=CSV_TO_API_MAPPING).to_dict(orient="records")
        for row in result:
            row["timestamp"] = str(row["timestamp"])
        return result

    def get_telemetry_by_node(self, node_id: str) -> list[dict]:
        """Return telemetry for a specific node."""
        filtered = self.df[self.df["node_id"] == node_id]
        if filtered.empty:
            return []
        result = filtered.rename(columns=CSV_TO_API_MAPPING).to_dict(orient="records")
        for row in result:
            row["timestamp"] = str(row["timestamp"])
        return result

    def get_node_ids(self) -> list[str]:
        """Return list of unique node IDs in the dataset."""
        return self.df["node_id"].unique().tolist()

    def get_latest_readings(self) -> dict[str, dict]:
        """Return the latest reading per node."""
        latest = self.df.sort_values("timestamp").groupby("node_id").last().reset_index()
        result: dict[str, dict] = {}
        for _, row in latest.iterrows():
            node_id = row["node_id"]
            result[node_id] = {
                CSV_TO_API_MAPPING[col]: (
                    str(row[col]) if col == "timestamp" else
                    float(row[col]) if col != "node_id" else row[col]
                )
                for col in CSV_TO_API_MAPPING
            }
        return result

    # ------------------------------------------------------------------
    # Statistical Analysis  (unchanged from original)
    # ------------------------------------------------------------------

    def get_statistics(self) -> dict[str, dict]:
        """Calculate statistical summaries per metric."""
        numeric_cols: dict[str, tuple[str, str]] = {
            "thickness_mm": ("thickness", "mm"),
            "temperature_c": ("temperature", "\u00b0C"),
            "air_pressure_hpa": ("pressure", "hPa"),
            "moisture_percent": ("moisture", "%"),
            "vibration_mps2": ("vibration", "m/s\u00b2"),
        }
        stats: dict[str, dict] = {}
        for csv_col, (api_name, unit) in numeric_cols.items():
            col_data = self.df[csv_col].dropna()
            if col_data.empty:
                continue
            first_val = float(col_data.iloc[0])
            last_val = float(col_data.iloc[-1])
            stats[api_name] = {
                "unit": unit,
                "min": round(float(col_data.min()), 2),
                "max": round(float(col_data.max()), 2),
                "mean": round(float(col_data.mean()), 2),
                "std": round(float(col_data.std()), 4),
                "latest": round(last_val, 2),
                "first": round(first_val, 2),
                "trend": (
                    "increasing" if last_val > first_val
                    else "decreasing" if last_val < first_val
                    else "stable"
                ),
            }
        return stats

    def get_time_series(self, node_id: Optional[str] = None) -> dict:
        """Extract time-series arrays for charting."""
        df = self.df
        if node_id:
            df = df[df["node_id"] == node_id]
        return {
            "timestamps": [str(t) for t in df["timestamp"].tolist()],
            "thickness": [round(float(v), 2) for v in df["thickness_mm"].tolist()],
            "temperature": [round(float(v), 2) for v in df["temperature_c"].tolist()],
            "pressure": [round(float(v), 2) for v in df["air_pressure_hpa"].tolist()],
            "moisture": [round(float(v), 2) for v in df["moisture_percent"].tolist()],
            "vibration": [round(float(v), 4) for v in df["vibration_mps2"].tolist()],
        }
