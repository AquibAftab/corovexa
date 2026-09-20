/**
 * COROVEXA API Service
 *
 * Centralized HTTP client for communicating with the FastAPI backend.
 * All API calls go through apiFetch() which handles errors and JSON parsing.
 *
 * Base URL defaults to http://localhost:8000 for local development.
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API path (e.g. '/api/telemetry')
 * @param {object} options  - fetch() options (method, body, headers, etc.)
 * @returns {Promise<any>} Parsed JSON response
 */
async function apiFetch(endpoint, options = {}) {
  try {
    const token = localStorage.getItem('corovexa_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`API ${response.status}: ${errorBody}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`[COROVEXA API] ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

/** Fetch all telemetry readings from the CSV dataset. */
export const fetchTelemetryAPI = () => apiFetch('/api/telemetry');

/** Fetch telemetry readings for a specific node. */
export const fetchTelemetryByNodeAPI = (nodeId) =>
  apiFetch(`/api/telemetry/${nodeId}`);

/** Fetch the latest reading per node. */
export const fetchLatestTelemetryAPI = () => apiFetch('/api/telemetry/latest');

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

/** Fetch pipeline assets with attached sensor data. */
export const fetchPipelineAPI = () => apiFetch('/api/pipeline');

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------

/** Fetch analytics: stats, KPIs, time-series, uptime history. */
export const fetchAnalyticsAPI = () => apiFetch('/api/analytics');

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------

/** Fetch current alerts from threshold evaluation. */
export const fetchAlertsAPI = () => apiFetch('/api/alerts');

/** Acknowledge an alert by ID. */
export const acknowledgeAlertAPI = (alertId, userName) =>
  apiFetch(`/api/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    body: JSON.stringify({ userName }),
  });

// ---------------------------------------------------------------------------
// Work Orders
// ---------------------------------------------------------------------------

/** Fetch all work orders. */
export const fetchWorkOrdersAPI = () => apiFetch('/api/workorders');

/** Create a new work order. */
export const createWorkOrderAPI = (data) =>
  apiFetch('/api/workorders', {
    method: 'POST',
    body: JSON.stringify(data),
  });

/** Update work order status. */
export const updateWorkOrderStatusAPI = (workOrderId, status) =>
  apiFetch(`/api/workorders/${workOrderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/** Authenticate with email and password. */
export const loginAPI = (email, password) =>
  apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
