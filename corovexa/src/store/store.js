// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import telemetryReducer from '../features/telemetry/telemetrySlice';
import workOrderReducer from '../features/workOrders/workOrderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    telemetry: telemetryReducer,
    workOrders: workOrderReducer,
  },
});