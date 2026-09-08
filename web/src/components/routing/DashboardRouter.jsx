import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import HODDashboard from '../../pages/dashboard/HODDashboard';
import FacultyDashboard from '../../pages/dashboard/FacultyDashboard';
import StudentDashboard from '../../pages/dashboard/StudentDashboard';

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'HOD':
      return <HODDashboard />;
    case 'Faculty':
      return <FacultyDashboard />;
    case 'Student':
      return <StudentDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default DashboardRouter;
