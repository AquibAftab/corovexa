// src/features/auth/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  role: null, // 'admin', 'operations_manager', 'maintenance_tech'
  jwtToken: null,
  isAuthenticated: false,
  iotConnection: true, // Mock active connection
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.role = action.payload.role;
      state.jwtToken = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.role = null;
      state.jwtToken = null;
      state.isAuthenticated = false;
    },
    setIotConnection: (state, action) => {
      state.iotConnection = action.payload;
    }
  },
});

export const { loginSuccess, logout, setIotConnection } = authSlice.actions;
export default authSlice.reducer;