// src/components/layout/OperationsLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Activity, LayoutDashboard, ActivitySquare, ClipboardList, FileText, BellOff, Menu, Map } from 'lucide-react';

export default function OperationsLayout() {
  const location = useLocation();
  const { iotConnection, user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Dashboard Overview', path: '/operations/dashboard', icon: LayoutDashboard },
    { name: 'Pipeline Monitoring', path: '/operations/pipelines', icon: ActivitySquare },
    { name: 'Work Orders & Dispatch', path: '/operations/work-orders', icon: ClipboardList },
    { name: 'Shift Handover', path: '/operations/reports', icon: FileText },
  ];

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      {/* Sidebar - Desktop persistent, Mobile hidden */}
      <div className="d-none d-md-flex flex-column bg-white border-end" style={{ width: '260px' }}>
        <div className="p-4 border-bottom d-flex align-items-center gap-2">
          <Activity size={24} className="text-primary" />
          <span className="fs-5 fw-bold tracking-wider">COROVEXA</span>
        </div>
        
        <div className="p-3">
          <span className="text-muted small fw-bold text-uppercase px-2">Operations Portal</span>
        </div>

        <nav className="flex-grow-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`d-flex align-items-center gap-3 px-3 py-2 mb-1 rounded text-decoration-none transition-colors ${
                  isActive ? 'bg-primary text-white shadow-sm' : 'text-dark hover-bg-light'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-white' : 'text-secondary'} />
                <span className="fw-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column overflow-auto">
        {/* Persistent Header */}
        <header className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center sticky-top">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light d-md-none p-2 border-0">
              <Menu size={20} />
            </button>
            <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">
              <Map size={14} className="text-secondary" />
              <span className="small fw-bold text-secondary">
                Zone: North Sector & Blast Furnace Feed
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2">
              <span className="small fw-bold text-secondary d-none d-md-block">Telemetry: Simulated Data</span>
              <div className={`rounded-circle ${iotConnection ? 'bg-success' : 'bg-danger'}`} style={{ width: '10px', height: '10px' }}></div>
            </div>

            <button className="btn btn-outline-danger d-inline-flex align-items-center gap-2 btn-sm fw-bold shadow-sm">
              <BellOff size={16} /> Mute Sirens
            </button>
            
            <div className="d-flex align-items-center gap-2 border-start ps-4">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold" style={{ width: '36px', height: '36px' }}>
                O
              </div>
              <div className="d-none d-lg-block">
                <div className="small fw-bold lh-1">{user || 'Operations Engineer'}</div>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Throughput Control</div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="p-4 flex-grow-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}