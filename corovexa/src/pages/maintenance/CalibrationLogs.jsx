// src/pages/maintenance/CalibrationLogs.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { PenTool, Save, History, ClipboardCheck } from 'lucide-react';
import { fetchPipelineData } from '../../features/telemetry/telemetrySlice';

export default function CalibrationLogs() {
  const { pipelines } = useSelector((state) => state.telemetry);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchPipelineData());
  }, [dispatch]);
  
  // Extract all unique sensor IDs for the dropdown
  const allSensors = pipelines.flatMap(p => p.sensors.map(s => s.sensorId));

  const [formData, setFormData] = useState({
    sensorId: allSensors[0] || '',
    preCalibration: '',
    postCalibration: '',
    notes: ''
  });

  // Mock historical logs
  const [logs, setLogs] = useState([
    { id: 1, date: '2026-09-10', sensorId: 'NODE_01-PRS', tech: 'Marcus Torres', variance: '-2.4%', notes: 'Re-zeroed pressure transducer.' },
    { id: 2, date: '2026-08-22', sensorId: 'NODE_01-TMP', tech: 'Priya Patel', variance: '+1.1%', notes: 'Cleaned temperature sensor optics.' }
  ]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Add the new log to the top of the history
    const newLog = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      sensorId: formData.sensorId,
      tech: user || 'Technician',
      variance: `${(((formData.postCalibration - formData.preCalibration) / formData.preCalibration) * 100).toFixed(1)}%`,
      notes: formData.notes
    };
    
    setLogs([newLog, ...logs]);
    setFormData({ ...formData, preCalibration: '', postCalibration: '', notes: '' });
    alert('Calibration log saved locally. Backend persistence pending.');
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Calibration Logs</h2>
        <p className="text-muted">Document sensor recalibrations to maintain compliance and accuracy.</p>
      </div>

      <div className="row g-4">
        {/* Entry Form */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm h-100 border-top border-primary border-4">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
              <PenTool size={20} className="text-primary" />
              <h6 className="fw-bold mb-0">New Entry</h6>
            </div>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Target Sensor</label>
                  <select 
                    className="form-select"
                    value={formData.sensorId}
                    onChange={(e) => setFormData({...formData, sensorId: e.target.value})}
                  >
                    {allSensors.map(id => (
                      <option key={id} value={id}>{id}</option>
                    ))}
                  </select>
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Pre-Cal Reading</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control" 
                      required
                      value={formData.preCalibration}
                      onChange={(e) => setFormData({...formData, preCalibration: e.target.value})}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-bold text-secondary">Post-Cal Reading</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="form-control" 
                      required
                      value={formData.postCalibration}
                      onChange={(e) => setFormData({...formData, postCalibration: e.target.value})}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-bold text-secondary">Maintenance Notes</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    required
                    placeholder="Describe adjustment procedure..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary w-100 fw-bold d-flex justify-content-center align-items-center gap-2">
                  <Save size={18} /> Submit Record
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Historical Audit Trail */}
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <History size={20} className="text-secondary" />
                <h6 className="fw-bold mb-0">Audit History</h6>
              </div>
              <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2">
                <ClipboardCheck size={14} /> Export CSV
              </button>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light text-muted small">
                    <tr>
                      <th className="ps-4">Date</th>
                      <th>Sensor Node</th>
                      <th>Technician</th>
                      <th>Drift / Variance</th>
                      <th className="pe-4">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td className="ps-4 text-muted small">{log.date}</td>
                        <td className="fw-bold">{log.sensorId}</td>
                        <td>{log.tech}</td>
                        <td>
                          <span className={`badge ${log.variance.includes('-') ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                            {log.variance}
                          </span>
                        </td>
                        <td className="pe-4 text-muted small">{log.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}