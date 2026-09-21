"""
S3 telemetry service for COROVEXA.

Reads sensor JSON objects from Amazon S3 using boto3.
Uses the default credential provider chain — never hardcodes keys.
"""

import json
import logging
from typing import Optional

import boto3
from botocore.exceptions import (
    BotoCoreError,
    ClientError,
    NoCredentialsError,
    EndpointConnectionError,
)

from ..config import settings

logger = logging.getLogger(__name__)

# Fields every S3 JSON object is expected to contain
EXPECTED_FIELDS = {
    "node_id",
    "timestamp",
    "thickness",
    "temperature",
    "moisture",
    "pressure",
    "vibration",
}

NUMERIC_FIELDS = {"thickness", "temperature", "moisture", "pressure", "vibration"}


def _build_s3_client():
    """Create a boto3 S3 client using environment / credential-chain config."""
    return boto3.client("s3", region_name=settings.AWS_REGION)


def check_s3_connection() -> dict:
    """
    Verify that S3 is reachable and the bucket exists.

    Returns a dict with:
        - "status": "ok" | "error"
        - "s3": "connected" | error description
        - "bucket": bucket name
        - "prefix": prefix in use
    """
    if not settings.S3_BUCKET_NAME:
        return {
            "status": "error",
            "s3": "S3_BUCKET_NAME not configured",
            "bucket": "",
            "prefix": settings.S3_PREFIX,
        }

    try:
        client = _build_s3_client()
        # HEAD bucket — lightweight existence + permission check
        client.head_bucket(Bucket=settings.S3_BUCKET_NAME)
        return {
            "status": "ok",
            "s3": "connected",
            "bucket": settings.S3_BUCKET_NAME,
            "prefix": settings.S3_PREFIX,
        }
    except NoCredentialsError:
        msg = "AWS credentials not found — run 'aws configure' or set environment variables"
        logger.error(msg)
        return {"status": "error", "s3": msg, "bucket": settings.S3_BUCKET_NAME, "prefix": settings.S3_PREFIX}
    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        if code == "403":
            msg = "Access denied to S3 bucket — check IAM permissions"
        elif code == "404":
            msg = "S3 bucket does not exist"
        else:
            msg = f"S3 ClientError ({code})"
        logger.error(msg)
        return {"status": "error", "s3": msg, "bucket": settings.S3_BUCKET_NAME, "prefix": settings.S3_PREFIX}
    except (BotoCoreError, EndpointConnectionError) as exc:
        msg = "Unable to reach S3 — check network and AWS_REGION"
        logger.error("%s: %s", msg, exc)
        return {"status": "error", "s3": msg, "bucket": settings.S3_BUCKET_NAME, "prefix": settings.S3_PREFIX}


def fetch_telemetry_records() -> list[dict]:
    """
    List, download, parse, and validate every .json object under the
    configured S3 prefix.

    Returns a list of validated sensor-data dicts.
    Skips (with warning) any object that is not valid JSON or is missing
    required fields.
    """
    if not settings.S3_BUCKET_NAME:
        raise ValueError("S3_BUCKET_NAME is not configured — cannot fetch telemetry")

    client = _build_s3_client()
    bucket = settings.S3_BUCKET_NAME
    prefix = settings.S3_PREFIX
    records: list[dict] = []

    try:
        # Paginate in case there are > 1000 objects
        paginator = client.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=bucket, Prefix=prefix)

        object_keys: list[str] = []
        for page in pages:
            for obj in page.get("Contents", []):
                key: str = obj["Key"]
                if key.lower().endswith(".json"):
                    object_keys.append(key)

        if not object_keys:
            logger.warning("No .json objects found under s3://%s/%s", bucket, prefix)
            return []

        logger.info(
            "Found %d JSON objects under s3://%s/%s",
            len(object_keys), bucket, prefix,
        )

        for key in object_keys:
            record = _download_and_parse(client, bucket, key)
            if record is not None:
                records.append(record)

    except NoCredentialsError:
        logger.error("AWS credentials not found — cannot list S3 objects")
        raise
    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        logger.error("S3 ClientError (%s) when listing objects", code)
        raise
    except (BotoCoreError, EndpointConnectionError) as exc:
        logger.error("Network/S3 error: %s", exc)
        raise

    logger.info("Successfully loaded %d telemetry records from S3", len(records))
    return records


def _download_and_parse(
    client, bucket: str, key: str
) -> Optional[dict]:
    """Download a single S3 JSON object, parse, and validate it."""
    try:
        response = client.get_object(Bucket=bucket, Key=key)
        body = response["Body"].read().decode("utf-8")
    except ClientError as exc:
        logger.warning("Failed to download s3://%s/%s — %s", bucket, key, exc.response["Error"]["Code"])
        return None
    except Exception as exc:
        logger.warning("Unexpected error downloading s3://%s/%s — %s", bucket, key, exc)
        return None

    # Parse JSON
    try:
        data = json.loads(body)
    except (json.JSONDecodeError, ValueError) as exc:
        logger.warning("Invalid JSON in s3://%s/%s — %s", bucket, key, exc)
        return None

    # Must be a dict
    if not isinstance(data, dict):
        logger.warning("S3 object %s is not a JSON object (got %s)", key, type(data).__name__)
        return None

    # Validate required fields
    missing = EXPECTED_FIELDS - set(data.keys())
    if missing:
        logger.warning("S3 object %s missing fields: %s", key, missing)
        return None

    # Coerce numeric fields
    for field in NUMERIC_FIELDS:
        try:
            data[field] = float(data[field])
        except (TypeError, ValueError):
            logger.warning(
                "S3 object %s has invalid numeric value for '%s': %r",
                key, field, data[field],
            )
            return None

    # Ensure node_id and timestamp are strings
    data["node_id"] = str(data["node_id"])
    data["timestamp"] = str(data["timestamp"])

    return data
