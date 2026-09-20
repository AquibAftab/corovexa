// src/components/layout/AdminLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Activity, LayoutDashboard, Settings, Users, Shield, Bell, Menu } from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const { iotConnection, user } = useSelector((state) => state.auth);

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Device & Thresholds', path: '/admin/devices', icon: Settings },
    { name: 'User Validation', path: '/admin/users', icon: Users },
    { name: 'System Logs', path: '/admin/logs', icon: Shield },
  ];

  return (
    <div className="d-flex vh-100 bg-light overflow-hidden">
      {/* Sidebar - Hidden on mobile (d-none), visible on medium screens and up (d-md-flex) */}
      <div className="d-none d-md-flex flex-column bg-white border-end" style={{ width: '260px' }}>
        <div className="p-4 border-bottom d-flex align-items-center gap-2">
          <Activity size={24} className="text-primary" />
          <span className="fs-5 fw-bold tracking-wider">COROVEXA</span>
        </div>
        
        <div className="p-3">
          <span className="text-muted small fw-bold text-uppercase px-2">Admin Portal</span>
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
              <div className={`rounded-circle ${iotConnection ? 'bg-success' : 'bg-danger'}`} style={{ width: '8px', height: '8px' }}></div>
              <span className="small fw-bold text-secondary">
                Backend: {iotConnection ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-4">
            <button className="btn btn-light position-relative p-2 rounded-circle border-0">
              <Bell size={20} className="text-secondary" />
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
            </button>
            <div className="d-flex align-items-center gap-2 border-start ps-4">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center fw-bold" style={{ width: '36px', height: '36px' }}>
                A
              </div>
              <div className="d-none d-lg-block">
                <div className="small fw-bold lh-1">{user || 'System Admin'}</div>
                <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Provisioning</div>
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