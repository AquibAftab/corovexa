// src/features/workOrders/workOrderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchWorkOrdersAPI, createWorkOrderAPI, updateWorkOrderStatusAPI } from '../../services/api';

export const fetchWorkOrdersData = createAsyncThunk(
  'workOrders/fetchWorkOrdersData',
  async () => {
    const response = await fetchWorkOrdersAPI();
    return response.jobs;
  }
);

export const createWorkOrderAsync = createAsyncThunk(
  'workOrders/createWorkOrderAsync',
  async (formData) => {
    const response = await createWorkOrderAPI(formData);
    return response;
  }
);

export const updateWorkOrderStatusAsync = createAsyncThunk(
  'workOrders/updateWorkOrderStatusAsync',
  async ({ workOrderId, status }) => {
    const response = await updateWorkOrderStatusAPI(workOrderId, status);
    return response;
  }
);


const initialState = {
  jobs: [
    { 
      workOrderId: 'WO-201', 
      targetPipeline: 'NODE_01', 
      targetSensor: 'NODE_01-THK', 
      priority: 'High', 
      assignedTechnician: 'Marcus Torres', 
      jobStatus: 'In Progress', 
      workType: 'Reactive',
      createdAt: new Date().toISOString()
    },
    { 
      workOrderId: 'WO-202', 
      targetPipeline: 'NODE_01', 
      targetSensor: 'NODE_01-TMP', 
      priority: 'Low', 
      assignedTechnician: 'Priya Patel', 
      jobStatus: 'Open', 
      workType: 'Planned',
      createdAt: new Date().toISOString()
    }
  ]
};

const workOrderSlice = createSlice({
  name: 'workOrders',
  initialState,
  reducers: {
    dispatchWorkOrder: (state, action) => {
      state.jobs.unshift({
        workOrderId: `WO-${Math.floor(Math.random() * 1000) + 300}`,
        ...action.payload,
        jobStatus: 'Open',
        createdAt: new Date().toISOString()
      });
    },
    updateJobStatus: (state, action) => {
      const job = state.jobs.find(j => j.workOrderId === action.payload.workOrderId);
      if (job) job.jobStatus = action.payload.status;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWorkOrdersData.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.jobs = action.payload;
        }
      })
      .addCase(createWorkOrderAsync.fulfilled, (state, action) => {
        if (action.payload) {
          state.jobs.unshift(action.payload);
        }
      })
      .addCase(updateWorkOrderStatusAsync.fulfilled, (state, action) => {
        if (action.payload) {
          const job = state.jobs.find(j => j.workOrderId === action.payload.workOrderId);
          if (job) job.jobStatus = action.payload.jobStatus;
        }
      });
  }
});

export const { dispatchWorkOrder, updateJobStatus } = workOrderSlice.actions;
export default workOrderSlice.reducer;