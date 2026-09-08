import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { Bell, Menu, LogOut, ChevronDown } from 'lucide-react';

const AppHeader = ({ toggleSidebar }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="app-header">
      {/* ── Left: hamburger + greeting ── */}
      <div className="header-left">
        <button
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          style={{ display: 'flex' }}
        >
          <Menu size={20} />
        </button>

        <div className="header-greeting">
          <div className="greeting-text">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'User'}
          </div>
          <div className="greeting-sub">
            {user?.role} · Attendance Workspace
          </div>
        </div>
      </div>

      {/* ── Right: bell + profile ── */}
      <div className="header-right">
        {/* Notification bell */}
        <button className="icon-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="notification-dot" />
        </button>

        {/* Profile menu */}
        <div className="profile-menu-container" ref={menuRef}>
          <button
            className="profile-btn"
            onClick={() => setMenuOpen(v => !v)}
            aria-label="User menu"
          >
            <div className="avatar">{initials}</div>
            <div className="profile-info hidden-mobile">
              <span className="profile-name">{user?.name}</span>
              <span className="profile-role">{user?.role}</span>
            </div>
            <ChevronDown
              size={14}
              className="hidden-mobile"
              style={{
                color: 'var(--text-muted)',
                flexShrink: 0,
                transition: 'transform 180ms ease',
                transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {menuOpen && (
            <div className="profile-dropdown">
              {/* Mobile-only user info */}
              <div className="dropdown-header mobile-only">
                <span className="profile-name">{user?.name}</span>
                <span className="profile-role">{user?.role}</span>
              </div>

              <button
                className="dropdown-item text-error"
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
