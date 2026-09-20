// src/pages/maintenance/TechDashboard.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateJobStatus, fetchWorkOrdersData } from '../../features/workOrders/workOrderSlice';
import { Wrench, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function TechDashboard() {
  const { jobs } = useSelector((state) => state.workOrders);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWorkOrdersData());
  }, [dispatch]);

  const handleStatusChange = (workOrderId, newStatus) => {
    dispatch(updateJobStatus({ workOrderId, status: newStatus }));
  };

  const openJobs = jobs.filter(j => j.jobStatus === 'Open');
  const inProgressJobs = jobs.filter(j => j.jobStatus === 'In Progress');
  const closedJobs = jobs.filter(j => j.jobStatus === 'Closed');

  const JobCard = ({ job, nextStatus, nextStatusText, btnClass, icon: Icon }) => (
    <div className="card border-0 shadow-sm mb-3 border-start border-4 border-secondary">
      <div className="card-body p-3">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <span className="fw-bold text-dark">{job.workOrderId}</span>
          <span className={`badge ${job.priority === 'Emergency' ? 'bg-danger' : job.priority === 'High' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
            {job.priority}
          </span>
        </div>
        <div className="small text-muted mb-3">
          <strong>Target:</strong> {job.targetPipeline} / {job.targetSensor}<br/>
          <strong>Type:</strong> {job.workType}
        </div>
        {nextStatus && (
          <button 
            className={`btn btn-sm w-100 d-inline-flex justify-content-center align-items-center gap-2 fw-bold shadow-sm ${btnClass}`}
            onClick={() => handleStatusChange(job.workOrderId, nextStatus)}
          >
            {Icon && <Icon size={14} />} {nextStatusText}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Job Execution Board</h2>
        <p className="text-muted">Manage active repair tasks and update operational status.</p>
      </div>

      {/* Kanban Grid: Stacks on mobile, 3 columns on tablet/desktop */}
      <div className="row g-4 h-100">
        
        {/* OPEN Column */}
        <div className="col-12 col-md-4 d-flex flex-column">
          <div className="d-flex align-items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-secondary" />
            <h6 className="fw-bold mb-0 text-secondary">OPEN ({openJobs.length})</h6>
          </div>
          <div className="bg-white rounded border p-3 flex-grow-1 shadow-sm" style={{ minHeight: '60vh' }}>
            {openJobs.length === 0 && <p className="text-muted small text-center mt-4">No open tickets.</p>}
            {openJobs.map(job => (
              <JobCard 
                key={job.workOrderId} 
                job={job} 
                nextStatus="In Progress" 
                nextStatusText="Start Work" 
                btnClass="btn-primary"
                icon={Wrench}
              />
            ))}
          </div>
        </div>

        {/* IN PROGRESS Column */}
        <div className="col-12 col-md-4 d-flex flex-column">
          <div className="d-flex align-items-center gap-2 mb-3">
            <Wrench size={18} className="text-primary" />
            <h6 className="fw-bold mb-0 text-primary">IN PROGRESS ({inProgressJobs.length})</h6>
          </div>
          <div className="bg-primary bg-opacity-10 rounded border border-primary border-opacity-25 p-3 flex-grow-1 shadow-sm" style={{ minHeight: '60vh' }}>
            {inProgressJobs.length === 0 && <p className="text-muted small text-center mt-4">No active repairs.</p>}
            {inProgressJobs.map(job => (
              <JobCard 
                key={job.workOrderId} 
                job={job} 
                nextStatus="Closed" 
                nextStatusText="Mark Complete" 
                btnClass="btn-success"
                icon={CheckCircle}
              />
            ))}
          </div>
        </div>

        {/* CLOSED Column */}
        <div className="col-12 col-md-4 d-flex flex-column">
          <div className="d-flex align-items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-success" />
            <h6 className="fw-bold mb-0 text-success">CLOSED ({closedJobs.length})</h6>
          </div>
          <div className="bg-light rounded border p-3 flex-grow-1 shadow-sm opacity-75" style={{ minHeight: '60vh' }}>
            {closedJobs.map(job => (
              <JobCard 
                key={job.workOrderId} 
                job={job} 
                nextStatus={null} 
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}