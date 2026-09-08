import React from 'react';
import attendxLogo from '../../assets/attendx-logo.png';
import sidebarBanner from '../../assets/banner.png';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserCircle, 
  Calendar, 
  CheckSquare, 
  FileBarChart,
  Clock,
  PlayCircle,
  ArrowLeftRight,
} from 'lucide-react';

const iconMap = {
  'Dashboard':            <LayoutDashboard size={18} />,
  'Academic Structure':   <BookOpen size={18} />,
  'Student Management':   <Users size={18} />,
  'Faculty Management':   <UserCircle size={18} />,
  'Class Schedule':       <Calendar size={18} />,
  'Attendance Monitoring':<CheckSquare size={18} />,
  'Reports':              <FileBarChart size={18} />,
  'My Attendance':        <CheckSquare size={18} />,
  'Overview':             <LayoutDashboard size={18} />,
  'Teaching Plan':        <BookOpen size={18} />,
  'Availability':         <Clock size={18} />,
  'Generate Timetable':   <PlayCircle size={18} />,
  'Published Timetables': <FileBarChart size={18} />,
};

const AppSidebar = ({ navLinks, isMobileOpen, setMobileOpen, workspace }) => {
  const navigate = useNavigate();

  return (
    <>
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`app-sidebar ${isMobileOpen ? 'open' : ''}`}
        style={{
          background: `
            linear-gradient(to bottom, #0D1B2A 25%, rgba(8,20,50,0.45) 100%),
            url(${sidebarBanner}) no-repeat center 55% / cover
          `,
        }}
      >
        {/* Logo header */}
        <div className="sidebar-header">
          <img
            src={attendxLogo}
            alt="AttendX"
            style={{ width: 30, height: 30, borderRadius: 6, flexShrink: 0 }}
          />
          <div style={{ minWidth: 0 }}>
            <div className="sidebar-brand">AttendX</div>
            <div className="sidebar-workspace-badge">
              {workspace === 'timetable' ? 'Timetable' : 'Attendance'}
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="sidebar-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">
                {iconMap[link.label] || <LayoutDashboard size={18} />}
              </span>
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-footer-actions">
            <button
              className="sidebar-switch-btn"
              onClick={() => navigate('/workspaces')}
            >
              <ArrowLeftRight size={14} />
              Switch Workspace
            </button>
          </div>
          <div className="sidebar-version">AttendX v1.0.0</div>
        </div>

      </aside>
    </>
  );
};

export default AppSidebar;
