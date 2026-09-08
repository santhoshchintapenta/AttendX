import React, { useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { AuthContext } from '../../context/AuthContext';
import { getNavigationLinks } from '../../config/navigation';

const DashboardLayout = ({ children }) => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const { user } = useContext(AuthContext);
  const location = useLocation();
  
  const workspace = location.pathname.startsWith('/timetable') ? 'timetable' : 'attendance';
  const navLinks = getNavigationLinks(user?.role, workspace);

  return (
    <div className="dashboard-layout">
      <AppSidebar 
        navLinks={navLinks} 
        isMobileOpen={isMobileOpen} 
        setMobileOpen={setMobileOpen} 
        workspace={workspace}
      />
      
      <div className="main-wrapper">
        <AppHeader toggleSidebar={() => setMobileOpen(!isMobileOpen)} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
