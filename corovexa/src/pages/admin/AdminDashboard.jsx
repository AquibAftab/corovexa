// src/pages/admin/AdminDashboard.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Server, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { fetchPipelineData, fetchAlertsData } from '../../features/telemetry/telemetrySlice';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { pipelines, activeAlerts, kpis } = useSelector((state) => state.telemetry);
  
  useEffect(() => {
    dispatch(fetchPipelineData());
    dispatch(fetchAlertsData());
  }, [dispatch]);
  
  const criticalAlerts = activeAlerts.filter(a => a.severity === 'Critical').length;
  const totalPipelines = pipelines.length;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold mb-1">System Overview</h2>
          <p className="text-muted mb-0">Global plant health and active network infrastructure.</p>
        </div>
      </div>

      {/* KPI Widgets Row - Responsive stacking */}
      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">Total Pipelines</h6>
                <div className="p-2 bg-light rounded text-primary"><Server size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1">{totalPipelines}</h3>
              <p className="text-success small fw-bold mb-0"><CheckCircle size={14} className="me-1"/> All Online</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">Active Sensors</h6>
                <div className="p-2 bg-light rounded text-info"><Activity size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1">{kpis.onlineSensors}</h3>
              <p className="text-muted small mb-0">Telemetry: Simulated Data</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">Data Availability</h6>
                <div className="p-2 bg-light rounded text-success"><Clock size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1">{kpis.uptimePercentage}%</h3>
              <p className="text-muted small mb-0">Simulated (CSV)</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 col-lg-3">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h6 className="text-muted fw-bold mb-0">Critical Breaches</h6>
                <div className="p-2 bg-danger bg-opacity-10 rounded text-danger"><AlertTriangle size={20} /></div>
              </div>
              <h3 className="fw-bold mb-1 text-danger">{criticalAlerts}</h3>
              <p className="text-danger small fw-bold mb-0">Requires Attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active System Alerts Feed */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <h6 className="fw-bold mb-0">Priority System Warnings</h6>
          <span className="badge bg-danger">{activeAlerts.length} Active</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-4">Severity</th>
                  <th>Pipeline ID</th>
                  <th>Condition</th>
                  <th>Impact</th>
                  <th>Timestamp</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td className="ps-4">
                      <span className={`badge ${alert.severity === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="fw-bold">{alert.pipelineId}</td>
                    <td>{alert.condition}</td>
                    <td className="text-muted">{alert.operationalImpact}</td>
                    <td className="text-muted small">{new Date(alert.timestamp).toLocaleTimeString()}</td>
                    <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-outline-secondary">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}