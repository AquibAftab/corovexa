// src/features/telemetry/telemetrySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchPipelineAPI, fetchAlertsAPI, fetchAnalyticsAPI } from '../../services/api';

export const fetchPipelineData = createAsyncThunk(
  'telemetry/fetchPipelineData',
  async () => {
    const response = await fetchPipelineAPI();
    return response.pipelines;
  }
);

export const fetchAlertsData = createAsyncThunk(
  'telemetry/fetchAlertsData',
  async () => {
    const response = await fetchAlertsAPI();
    return response.alerts;
  }
);

export const fetchKpisData = createAsyncThunk(
  'telemetry/fetchKpisData',
  async () => {
    const response = await fetchAnalyticsAPI();
    return response.kpis;
  }
);

const initialState = {
  pipelines: [
    {
      pipelineId: 'NODE_01',
      location: 'Blast Furnace Feed',
      pipelineStatus: 'Critical',
      sensors: [
        { sensorId: 'NODE_01-THK', metric: 'Wall Thinning', currentValue: 1.25, unit: 'mm', thresholds: { warningMax: 0.5, criticalMax: 1.0 }, status: 'Critical' },
        { sensorId: 'NODE_01-TMP', metric: 'Temperature', currentValue: 67.6, unit: '°C', thresholds: { warningMax: 65.0, criticalMax: 67.0 }, status: 'Critical' },
        { sensorId: 'NODE_01-PRS', metric: 'Pressure', currentValue: 1015.0, unit: 'hPa', thresholds: { warningMax: 1014.0, criticalMax: 1015.0 }, status: 'Critical' },
        { sensorId: 'NODE_01-MST', metric: 'Moisture', currentValue: 57.0, unit: '%', thresholds: { warningMax: 48.0, criticalMax: 53.0 }, status: 'Critical' },
        { sensorId: 'NODE_01-VIB', metric: 'Vibration', currentValue: 0.51, unit: 'm/s²', thresholds: { warningMax: 0.35, criticalMax: 0.45 }, status: 'Critical' }
      ]
    }
  ],
  activeAlerts: [
    { id: 1, timestamp: new Date().toISOString(), pipelineId: 'NODE_01', severity: 'Critical', condition: 'Wall Thinning at 1.25 mm (exceeds critical threshold 1.0 mm)', operationalImpact: 'Wall Thinning breach may require immediate intervention', isAcknowledged: false }
  ],
  kpis: {
    uptimePercentage: 0,
    onlineSensors: 5,
    mttr: 5.7, // hours (simulated)
    mtbf: 600 // hours (simulated)
  }
};

const telemetrySlice = createSlice({
  name: 'telemetry',
  initialState,
  reducers: {
    acknowledgeAlert: (state, action) => {
      const alert = state.activeAlerts.find(a => a.id === action.payload.alertId);
      if (alert) {
        alert.isAcknowledged = true;
        alert.acknowledgedBy = action.payload.userName;
      }
    },

    updateSensorThreshold: (state, action) => {
      const { pipelineId, sensorId, warningMax, criticalMax } = action.payload;
      const pipeline = state.pipelines.find(p => p.pipelineId === pipelineId);
      if (pipeline) {
        const sensor = pipeline.sensors.find(s => s.sensorId === sensorId);
        if (sensor) {
          sensor.thresholds = { 
            warningMax: Number(warningMax), 
            criticalMax: Number(criticalMax) 
          };
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPipelineData.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.pipelines = action.payload;
        }
      })
      .addCase(fetchAlertsData.fulfilled, (state, action) => {
        if (action.payload) {
          state.activeAlerts = action.payload;
        }
      })
      .addCase(fetchKpisData.fulfilled, (state, action) => {
        if (action.payload) {
          state.kpis = action.payload;
        }
      });
  }
});

export const { acknowledgeAlert, updateSensorThreshold } = telemetrySlice.actions;
export default telemetrySlice.reducer;