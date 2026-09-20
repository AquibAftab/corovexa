// src/pages/admin/SystemLogs.jsx
import { useState } from 'react';
import { Terminal, Filter, Activity } from 'lucide-react';

export default function SystemLogs() {
  // Mock data for the system audit trail
  const [logs] = useState([
    { id: 101, timestamp: '2026-09-17T10:45:22Z', initiator: 'Admin User', actionType: 'Threshold Update', targetNode: 'NODE_01-PRS', details: 'warningMax changed to 1014 hPa' },
    { id: 102, timestamp: '2026-09-17T09:12:05Z', initiator: 'Simulated Telemetry', actionType: 'Automated Alert', targetNode: 'NODE_01', details: 'Critical pressure breach detected' },
    { id: 103, timestamp: '2026-09-16T16:30:00Z', initiator: 'Operations Engineer (R. Chen)', actionType: 'Maintenance Mode', targetNode: 'NODE_01', details: 'Sirens muted for scheduled inspection' },
    { id: 104, timestamp: '2026-09-16T08:05:11Z', initiator: 'Admin User', actionType: 'User Approved', targetNode: 'S. Jenkins', details: 'Assigned role: Operations Engineer' }
  ]);

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">System Command Logs</h2>
          <p className="text-muted mb-0">System activity and audit events for all commands and system events.</p>
        </div>
        <button className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 shadow-sm">
          <Filter size={16} /> Filter Logs
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
          <Terminal size={20} className="text-secondary" />
          <h6 className="fw-bold mb-0">Recent Activity Feed</h6>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-4">Timestamp</th>
                  <th>Initiator</th>
                  <th>Action Type</th>
                  <th>Target Node</th>
                  <th className="pe-4">Details</th>
                </tr>
              </thead>
              <tbody className="font-monospace small">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="ps-4 text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="fw-bold text-dark">{log.initiator}</td>
                    <td>
                      <span className={`badge ${log.actionType.includes('Alert') ? 'bg-danger' : 'bg-light text-dark border'}`}>
                        {log.actionType}
                      </span>
                    </td>
                    <td>{log.targetNode}</td>
                    <td className="pe-4 text-muted">{log.details}</td>
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