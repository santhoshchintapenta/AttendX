import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, Calendar, ArrowRight, LogOut } from 'lucide-react';
import attendxLogo from '../assets/attendx-logo.png';

const WorkspaceSelection = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Students do not use workspace selection — redirect immediately
  useEffect(() => {
    if (user?.role === 'Student') {
      navigate('/attendance/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div className="flex items-center gap-3">
          <img src={attendxLogo} alt="AttendX Logo" style={{ width: 32, height: 32, borderRadius: 6 }} />
          <h1 className="section-title" style={{ marginBottom: 0 }}>AttendX</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="body-text" style={{ fontWeight: 600 }}>{user?.name} ({user?.role})</span>
          <button className="btn btn-secondary" onClick={logout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>
      
      <div className="workspace-content">
        <div className="text-center mb-6">
          <h2 className="page-title">Select Workspace</h2>
          <p className="body-text">Choose an application to continue to your dashboard.</p>
        </div>

        <div className="workspace-grid">
          <div className="workspace-card" onClick={() => navigate('/attendance/dashboard')}>
            <div className="workspace-icon-wrapper" style={{ backgroundColor: 'var(--primary-light, #e0f2fe)', color: 'var(--primary)' }}>
              <Users size={32} />
            </div>
            <h3 className="workspace-title">Student Attendance</h3>
            <p className="workspace-desc">Manage academic structure, students, faculty, and track class attendance.</p>
            <div className="workspace-footer">
              <span className="workspace-cta">Open Application</span>
              <ArrowRight className="workspace-arrow" size={18} />
            </div>
          </div>

          <div className="workspace-card" onClick={() => navigate('/timetable')}>
            <div className="workspace-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#9333ea' }}>
              <Calendar size={32} />
            </div>
            <h3 className="workspace-title">Smart Timetable</h3>
            <p className="workspace-desc">AI-powered scheduling and resource allocation for your department.</p>
            <div className="workspace-footer">
              <span className="workspace-cta">Open Application</span>
              <ArrowRight className="workspace-arrow" size={18} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSelection;
