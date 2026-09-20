// src/pages/maintenance/HardwareDiagnostics.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Cpu, RefreshCw, Power, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { fetchPipelineData } from '../../features/telemetry/telemetrySlice';

export default function HardwareDiagnostics() {
  const { pipelines } = useSelector((state) => state.telemetry);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPipelineData());
  }, [dispatch]);
  
  // Local state to track devices currently undergoing a reboot simulation
  const [rebootingDevices, setRebootingDevices] = useState({});

  const handleReboot = (sensorId) => {
    setRebootingDevices(prev => ({ ...prev, [sensorId]: true }));
    
    // Simulate a 3-second remote reboot sequence
    setTimeout(() => {
      setRebootingDevices(prev => ({ ...prev, [sensorId]: false }));
      alert(`Node ${sensorId} simulated reboot complete. Reconnected to backend.`);
    }, 3000);
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Hardware Diagnostics</h2>
        <p className="text-muted">Inspect simulated node health, firmware status, and execute diagnostic resets.</p>
      </div>

      <div className="row g-4">
        {pipelines.map(pipeline => (
          pipeline.sensors.map(sensor => {
            const isRebooting = rebootingDevices[sensor.sensorId];

            return (
              <div key={sensor.sensorId} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center gap-2">
                      <Cpu size={18} className="text-secondary" />
                      <h6 className="fw-bold mb-0">{sensor.sensorId}</h6>
                    </div>
                    {isRebooting ? (
                      <span className="badge bg-warning text-dark d-flex align-items-center gap-1">
                        <RefreshCw size={12} className="spinner-border spinner-border-sm border-0" /> Rebooting
                      </span>
                    ) : (
                      <span className={`badge ${sensor.status === 'Active' ? 'bg-success' : 'bg-danger'}`}>
                        {sensor.status}
                      </span>
                    )}
                  </div>
                  
                  <div className="card-body">
                    <div className="row g-3 mb-4">
                      <div className="col-6">
                        <div className="small text-muted fw-bold mb-1">Metric Target</div>
                        <div className="fw-medium">{sensor.metric}</div>
                      </div>
                      <div className="col-6">
                        <div className="small text-muted fw-bold mb-1">Parent Asset</div>
                        <div className="fw-medium">{pipeline.pipelineId}</div>
                      </div>
                      <div className="col-6">
                        <div className="small text-muted fw-bold mb-1">Firmware Build</div>
                        <div className="fw-medium font-monospace small">v2.4.1-stable</div>
                      </div>
                      <div className="col-6">
                        <div className="small text-muted fw-bold mb-1">Backend Connection</div>
                        <div className="fw-medium text-success d-flex align-items-center gap-1">
                          <Radio size={14} /> Local API
                        </div>
                      </div>
                    </div>

                    {/* Diagnostic Readings */}
                    <div className="bg-light p-3 rounded mb-4">
                      <div className="d-flex justify-content-between mb-2 small">
                        <span className="text-muted fw-bold">Internal Temp:</span>
                        <span className="fw-bold text-muted">Simulated</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2 small">
                        <span className="text-muted fw-bold">Battery / Power:</span>
                        <span className="fw-bold text-muted">Simulated</span>
                      </div>
                      <div className="d-flex justify-content-between small">
                        <span className="text-muted fw-bold">Signal Strength:</span>
                        <span className="fw-bold text-muted">Simulated</span>
                      </div>
                    </div>

                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-outline-primary flex-grow-1 d-inline-flex justify-content-center align-items-center gap-2 fw-bold"
                        onClick={() => handleReboot(sensor.sensorId)}
                        disabled={isRebooting}
                      >
                        <Power size={16} /> {isRebooting ? 'Sending...' : 'Simulate Reboot'}
                      </button>
                      <button className="btn btn-outline-secondary px-3" disabled={isRebooting}>
                        Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ))}
      </div>
    </div>
  );
}