// src/pages/operations/WorkOrders.jsx
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { dispatchWorkOrder, fetchWorkOrdersData } from '../../features/workOrders/workOrderSlice';
import { ClipboardList, Plus, User, AlertCircle } from 'lucide-react';

export default function WorkOrders() {
  const { jobs } = useSelector((state) => state.workOrders);
  const dispatch = useDispatch();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    dispatch(fetchWorkOrdersData());
  }, [dispatch]);

  // Form State
  const [formData, setFormData] = useState({
    targetPipeline: 'NODE_01',
    targetSensor: 'NODE_01-THK',
    priority: 'Medium',
    workType: 'Reactive',
    assignedTechnician: 'Marcus Torres'
  });

  const handleDispatch = (e) => {
    e.preventDefault();
    dispatch(dispatchWorkOrder(formData));
    setShowForm(false);
    alert('Work order dispatched to Maintenance Team.');
  };

  const getPriorityBadge = (priority) => {
    const colors = { Emergency: 'bg-danger', High: 'bg-warning text-dark', Medium: 'bg-info text-dark', Low: 'bg-secondary' };
    return <span className={`badge ${colors[priority]}`}>{priority}</span>;
  };

  const getStatusBadge = (status) => {
    const colors = { 'Open': 'bg-light text-primary border border-primary', 'In Progress': 'bg-primary', 'Closed': 'bg-success' };
    return <span className={`badge ${colors[status] || 'bg-secondary'}`}>{status}</span>;
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Work Orders & Dispatch</h2>
          <p className="text-muted mb-0">Track repair cycles and dispatch technicians to critical faults.</p>
        </div>
        <button 
          className="btn btn-primary d-inline-flex align-items-center gap-2 shadow-sm fw-bold"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={18} /> {showForm ? 'Cancel Dispatch' : 'New Dispatch'}
        </button>
      </div>

      {showForm && (
        <div className="card border-0 shadow-sm mb-4 border-top border-primary border-4">
          <div className="card-body p-4">
            <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <AlertCircle size={18} className="text-primary" /> Issue New Work Order
            </h6>
            <form onSubmit={handleDispatch} className="row g-3">
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Target Pipeline</label>
                <select className="form-select" value={formData.targetPipeline} onChange={e => setFormData({...formData, targetPipeline: e.target.value})}>
                  <option>NODE_01</option>
                </select>
              </div>
              <div className="col-md-3">
                <label className="form-label small fw-bold text-secondary">Target Node / Sensor</label>
                <input type="text" className="form-control" value={formData.targetSensor} onChange={e => setFormData({...formData, targetSensor: e.target.value})} />
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary">Priority</label>
                <select className="form-select" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                  <option>Emergency</option><option>High</option><option>Medium</option><option>Low</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label small fw-bold text-secondary">Work Type</label>
                <select className="form-select" value={formData.workType} onChange={e => setFormData({...formData, workType: e.target.value})}>
                  <option>Reactive</option><option>Planned</option>
                </select>
              </div>
              <div className="col-md-2 d-flex align-items-end">
                <button type="submit" className="btn btn-success w-100 fw-bold">Dispatch Now</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
          <ClipboardList size={20} className="text-secondary" />
          <h6 className="fw-bold mb-0">Active Dispatch Board</h6>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-4">Tracking ID</th>
                  <th>Priority</th>
                  <th>Asset Target</th>
                  <th>Assigned Tech</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.workOrderId}>
                    <td className="ps-4 fw-bold">{job.workOrderId}</td>
                    <td>{getPriorityBadge(job.priority)}</td>
                    <td>
                      <div>{job.targetPipeline}</div>
                      <div className="small text-muted">{job.targetSensor}</div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="bg-light rounded-circle p-1"><User size={14} className="text-secondary" /></div>
                        {job.assignedTechnician}
                      </div>
                    </td>
                    <td>{getStatusBadge(job.jobStatus)}</td>
                    <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-outline-secondary">View Notes</button>
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