"""
Data processor service for COROVEXA telemetry data.
Loads and processes COROVEXA_cloud_dataset.csv using Pandas.
Designed with a clean interface so the CSV source can be
replaced by DynamoDB without rewriting the application.
"""

import os
from pathlib import Path
from typing import Optional

import pandas as pd


# Field name mapping: CSV columns -> API field names
CSV_TO_API_MAPPING: dict[str, str] = {
    "timestamp": "timestamp",
    "node_id": "node_id",
    "thickness_mm": "thickness",
    "temperature_c": "temperature",
    "air_pressure_hpa": "pressure",
    "moisture_percent": "moisture",
    "vibration_mps2": "vibration",
}

# Nominal wall thickness for thinning calculations
NOMINAL_THICKNESS_MM: float = 50.0


class DataProcessor:
    """Service for loading and processing telemetry data from CSV.

    Singleton pattern ensures the CSV is loaded once and cached in memory.
    Call reload() to refresh data if the CSV changes.
    """

    _instance: Optional["DataProcessor"] = None
    _df: Optional[pd.DataFrame] = None

    def __init__(self) -> None:
        self._load_data()

    @classmethod
    def get_instance(cls) -> "DataProcessor":
        """Return the singleton DataProcessor instance."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Data Loading
    # ------------------------------------------------------------------

    def _get_csv_path(self) -> Path:
        """Resolve the path to COROVEXA_cloud_dataset.csv."""
        possible_paths = [
            # Relative to backend/app/services/ -> ../../data/
            Path(__file__).resolve().parent.parent.parent.parent / "data" / "COROVEXA_cloud_dataset.csv",
            # Relative to backend/ -> ../data/
            Path(__file__).resolve().parent.parent.parent / "data" / "COROVEXA_cloud_dataset.csv",
            # Project root level (Corovexa-main/)
            Path(__file__).resolve().parent.parent.parent.parent.parent / "COROVEXA_cloud_dataset.csv",
        ]

        # Environment variable override
        env_path = os.environ.get("COROVEXA_CSV_PATH")
        if env_path:
            possible_paths.insert(0, Path(env_path))

        for p in possible_paths:
            if p is not None and p.exists():
                return p

        raise FileNotFoundError(
            "COROVEXA_cloud_dataset.csv not found. "
            "Expected in data/ directory or set COROVEXA_CSV_PATH env var. "
            f"Searched: {[str(p) for p in possible_paths if p]}"
        )

    def _load_data(self) -> None:
        """Load and validate the CSV dataset."""
        csv_path = self._get_csv_path()
        self._df = pd.read_csv(csv_path, parse_dates=["timestamp"])

        # Validate required columns exist
        required_cols = set(CSV_TO_API_MAPPING.keys())
        actual_cols = set(self._df.columns)
        missing = required_cols - actual_cols
        if missing:
            raise ValueError(f"CSV missing required columns: {missing}")

        # Handle missing values
        self._df = self._df.dropna(subset=["node_id", "timestamp"])

        # Ensure correct types
        for col in ["thickness_mm", "temperature_c", "air_pressure_hpa",
                     "moisture_percent", "vibration_mps2"]:
            self._df[col] = pd.to_numeric(self._df[col], errors="coerce")

        # Sort chronologically
        self._df = self._df.sort_values("timestamp").reset_index(drop=True)

    def reload(self) -> None:
        """Reload data from CSV (useful if dataset is updated)."""
        self._load_data()

    @property
    def df(self) -> pd.DataFrame:
        """Access the loaded DataFrame."""
        if self._df is None:
            self._load_data()
        return self._df

    # ------------------------------------------------------------------
    # Query Methods
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
    # Statistical Analysis
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
