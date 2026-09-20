// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import DeviceThresholds from './pages/admin/DeviceThresholds';
import UserValidation from './pages/admin/UserValidation';
import SystemLogs from './pages/admin/SystemLogs';
import OperationsLayout from './components/layout/OperationsLayout';
import OpsDashboard from './pages/operations/OpsDashboard';
import PipelineMonitoring from './pages/operations/PipelineMonitoring';
import WorkOrders from './pages/operations/WorkOrders';
import ShiftHandover from './pages/operations/ShiftHandover';
import MaintenanceLayout from './components/layout/MaintenanceLayout';
import TechDashboard from './pages/maintenance/TechDashboard';
import HardwareDiagnostics from './pages/maintenance/HardwareDiagnostics';
import CalibrationLogs from './pages/maintenance/CalibrationLogs';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Admin Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="devices" element={<DeviceThresholds />} />
          <Route path="users" element={<UserValidation />} />
          <Route path="logs" element={<SystemLogs />} />
        </Route>

        {/* Operations Portal Routes */}
        <Route path="/operations" element={<OperationsLayout />}>
          <Route path="dashboard" element={<OpsDashboard />} />
          <Route path="pipelines" element={<PipelineMonitoring />} />
          <Route path="work-orders" element={<WorkOrders />} />
          <Route path="reports" element={<ShiftHandover />} />
        </Route>

        {/* Maintenance Portal Routes */}
        <Route path="/maintenance" element={<MaintenanceLayout />}>
          <Route path="dashboard" element={<TechDashboard />} />
          <Route path="diagnostics" element={<HardwareDiagnostics />} />
          <Route path="calibration" element={<CalibrationLogs />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;