// src/pages/admin/DeviceThresholds.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Settings, Save, Cpu } from 'lucide-react';
import { updateSensorThreshold, fetchPipelineData } from '../../features/telemetry/telemetrySlice';

export default function DeviceThresholds() {
  const { pipelines } = useSelector((state) => state.telemetry);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPipelineData());
  }, [dispatch]);
  
  // Local state to handle form inputs before saving to Redux
  const [editValues, setEditValues] = useState({});

  const handleInputChange = (sensorId, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [sensorId]: {
        ...prev[sensorId],
        [field]: value
      }
    }));
  };

  const handleSave = (pipelineId, sensor) => {
    const updates = editValues[sensor.sensorId] || {};
    const warningMax = updates.warningMax || sensor.thresholds.warningMax;
    const criticalMax = updates.criticalMax || sensor.thresholds.criticalMax;

    // Dispatch to Redux (local threshold update)
    dispatch(updateSensorThreshold({
      pipelineId,
      sensorId: sensor.sensorId,
      warningMax,
      criticalMax
    }));
    
    alert(`Thresholds updated for ${sensor.sensorId}`);
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Device & Threshold Calibration</h2>
        <p className="text-muted">Manage sensor thresholds and safety limits for simulated monitoring nodes.</p>
      </div>

      <div className="row g-4">
        {pipelines.map((pipeline) => (
          <div key={pipeline.pipelineId} className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
                <Cpu size={20} className="text-primary" />
                <h6 className="fw-bold mb-0">{pipeline.pipelineId} - {pipeline.location}</h6>
                <span className={`badge ms-auto ${pipeline.pipelineStatus === 'Healthy' ? 'bg-success' : 'bg-danger'}`}>
                  {pipeline.pipelineStatus}
                </span>
              </div>
              
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-muted small">
                      <tr>
                        <th className="ps-4">Sensor ID</th>
                        <th>Metric Type</th>
                        <th>Current Reading</th>
                        <th>Warning Limit</th>
                        <th>Critical Limit</th>
                        <th className="pe-4 text-end">Configuration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pipeline.sensors.map((sensor) => {
                        const localWarning = editValues[sensor.sensorId]?.warningMax ?? sensor.thresholds.warningMax;
                        const localCritical = editValues[sensor.sensorId]?.criticalMax ?? sensor.thresholds.criticalMax;

                        return (
                          <tr key={sensor.sensorId}>
                            <td className="ps-4 fw-bold">{sensor.sensorId}</td>
                            <td>{sensor.metric}</td>
                            <td>
                              <span className="fw-medium">{sensor.currentValue}</span> {sensor.unit}
                            </td>
                            <td>
                              <div className="input-group input-group-sm" style={{ width: '120px' }}>
                                <input 
                                  type="number" 
                                  className="form-control text-center" 
                                  value={localWarning}
                                  onChange={(e) => handleInputChange(sensor.sensorId, 'warningMax', e.target.value)}
                                />
                                <span className="input-group-text bg-light">{sensor.unit}</span>
                              </div>
                            </td>
                            <td>
                              <div className="input-group input-group-sm" style={{ width: '120px' }}>
                                <input 
                                  type="number" 
                                  className="form-control text-center" 
                                  value={localCritical}
                                  onChange={(e) => handleInputChange(sensor.sensorId, 'criticalMax', e.target.value)}
                                />
                                <span className="input-group-text bg-light">{sensor.unit}</span>
                              </div>
                            </td>
                            <td className="pe-4 text-end">
                              <button 
                                className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1"
                                onClick={() => handleSave(pipeline.pipelineId, sensor)}
                              >
                                <Save size={14} /> Update
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}