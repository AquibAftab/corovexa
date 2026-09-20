// src/components/layout/MaintenanceLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Activity, LayoutDashboard, Wrench, PenTool, Menu, MapPin } from 'lucide-react';

export default function MaintenanceLayout() {
  const location = useLocation();
  const { iotConnection, user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Job Execution', path: '/maintenance/dashboard', icon: LayoutDashboard },
    { name: 'Hardware Diagnostics', path: '/maintenance/diagnostics', icon: Wrench },
    { name: 'Calibration Logs', path: '/maintenance/calibration', icon: PenTool },
  ];

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      {/* Sidebar - Hidden on mobile, offcanvas style for field workers */}
      <div className="d-none d-md-flex flex-column bg-white border-end" style={{ width: '260px' }}>
        <div className="p-4 border-bottom d-flex align-items-center gap-2">
          <Activity size={24} className="text-primary" />
          <span className="fs-5 fw-bold tracking-wider">COROVEXA</span>
        </div>
        
        <div className="p-3">
          <span className="text-muted small fw-bold text-uppercase px-2">Tech Portal</span>
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
            <div className="d-flex align-items-center gap-2 px-3 py-1 bg-light rounded-pill border">
              <MapPin size={14} className="text-secondary" />
              <span className="small fw-bold text-secondary">
                On-Site: Blast Furnace Feed
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <div className="d-none d-sm-flex align-items-center gap-2">
              <span className="small fw-bold text-secondary">Network:</span>
              <div className={`rounded-circle ${iotConnection ? 'bg-success' : 'bg-danger'}`} style={{ width: '10px', height: '10px' }}></div>
            </div>
            
            <div className="d-flex align-items-center gap-2 border-start ps-sm-4 ps-2">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold" style={{ width: '36px', height: '36px' }}>
                T
              </div>
              <div className="d-none d-lg-block">
                <div className="small fw-bold lh-1">{user || 'Technician'}</div>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Field Maintenance</div>
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