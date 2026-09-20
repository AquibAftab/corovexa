// src/pages/operations/ShiftHandover.jsx
import { FileText, Download, Send } from 'lucide-react';

export default function ShiftHandover() {
  return (
    <div className="container-fluid p-0">
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Shift Handover & Reports</h2>
        <p className="text-muted">Document operational constraints for the incoming shift and export plant audits.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3 d-flex align-items-center gap-2">
              <FileText size={20} className="text-primary" />
              <h6 className="fw-bold mb-0">Log Shift Notes</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label small fw-bold text-secondary">Incoming Manager Briefing</label>
                <textarea 
                  className="form-control border-secondary" 
                  rows="6" 
                  placeholder="E.g., NODE_01 pressure spiked twice during the night shift. Maintenance dispatched but monitoring is highly recommended..."
                ></textarea>
              </div>
              <button className="btn btn-primary fw-bold d-inline-flex align-items-center gap-2 shadow-sm">
                <Send size={16} /> Submit Handover Log
              </button>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-header bg-white border-bottom py-3">
              <h6 className="fw-bold mb-0">Generate Reports</h6>
            </div>
            <div className="card-body d-flex flex-column gap-3">
              <p className="small text-muted mb-2">
                Generate downloadable reports and telemetry exports from backend data.
              </p>
              
              <div className="p-3 border rounded d-flex justify-content-between align-items-center bg-light">
                <div>
                  <div className="fw-bold">Weekly Pipeline Audit</div>
                  <div className="small text-muted">PDF - Last 7 Days</div>
                </div>
                <button className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-2">
                  <Download size={14} /> Export
                </button>
              </div>

              <div className="p-3 border rounded d-flex justify-content-between align-items-center bg-light">
                <div>
                  <div className="fw-bold">Telemetry Raw Dump</div>
                  <div className="small text-muted">CSV - Last 24 Hours</div>
                </div>
                <button className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-2">
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}