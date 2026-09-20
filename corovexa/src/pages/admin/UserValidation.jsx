// src/pages/admin/UserValidation.jsx
import { useState } from 'react';
import { ShieldQuestion, UserCheck, UserX, Clock } from 'lucide-react';

export default function UserValidation() {
  // Mock data for pending personnel approvals
  const [pendingUsers, setPendingUsers] = useState([
    { id: 1, fullName: 'Sarah Jenkins', email: 's.jenkins@corovexa.com', requestedRole: 'Operations Engineer', appliedOn: '2026-09-17T08:30:00Z' },
    { id: 2, fullName: 'Marcus Torres', email: 'm.torres@corovexa.com', requestedRole: 'Maintenance Technician', appliedOn: '2026-09-16T14:15:00Z' },
    { id: 3, fullName: 'Priya Patel', email: 'p.patel@corovexa.com', requestedRole: 'Maintenance Technician', appliedOn: '2026-09-15T09:00:00Z' }
  ]);

  const handleAction = (id, action, name) => {
    // Remove the user from the pending list to mock a database update
    setPendingUsers(pendingUsers.filter(user => user.id !== id));
    alert(`${name} has been ${action}. System access policies updated.`);
  };

  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">User Validation</h2>
        <p className="text-muted">Review and authorize pending personnel access requests.</p>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom py-3 d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2">
            <ShieldQuestion size={20} className="text-warning" />
            <h6 className="fw-bold mb-0">Pending Approvals</h6>
          </div>
          <span className="badge bg-warning text-dark">{pendingUsers.length} Awaiting</span>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-muted small">
                <tr>
                  <th className="ps-4">Applicant Name</th>
                  <th>Email Address</th>
                  <th>Requested Role</th>
                  <th>Date Applied</th>
                  <th className="pe-4 text-end">Authorization</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">No pending access requests.</td>
                  </tr>
                ) : (
                  pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="ps-4 fw-bold">{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`badge ${user.requestedRole === 'Operations Engineer' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                          {user.requestedRole}
                        </span>
                      </td>
                      <td className="text-muted small">
                        <Clock size={14} className="me-1 mb-1 d-inline-block" />
                        {new Date(user.appliedOn).toLocaleDateString()}
                      </td>
                      <td className="pe-4 text-end">
                        <div className="btn-group shadow-sm">
                          <button 
                            className="btn btn-sm btn-success d-inline-flex align-items-center gap-1"
                            onClick={() => handleAction(user.id, 'approved', user.fullName)}
                          >
                            <UserCheck size={16} /> Approve
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1"
                            onClick={() => handleAction(user.id, 'rejected', user.fullName)}
                          >
                            <UserX size={16} /> Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}