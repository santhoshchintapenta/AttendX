import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { useContext } from 'react';
import Login from './pages/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import VerifyOTP from './pages/auth/VerifyOTP';
import ResetPassword from './pages/auth/ResetPassword';
import PasswordResetSuccess from './pages/auth/PasswordResetSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import WorkspaceSelection from './pages/WorkspaceSelection';
import DashboardRouter from './components/routing/DashboardRouter';
import AcademicStructure from './pages/academic/AcademicStructure';
import StudentManagement from './pages/dashboard/StudentManagement';
import TimetableOverview from './pages/timetable/Overview';
import TeachingPlan from './pages/timetable/TeachingPlan';
import Availability from './pages/timetable/Availability';
import GenerateTimetable from './pages/timetable/GenerateTimetable';
import Timetables from './pages/timetable/Timetables';
import FacultyManagement from './pages/faculty/FacultyManagement';
import FacultyDetails from './pages/faculty/FacultyDetails';
import { getNavigationLinks } from './config/navigation';
import './index.css';

import DashboardLayout from './components/layout/DashboardLayout';
import EmptyState from './components/ui/EmptyState';
import PageHeader from './components/ui/PageHeader';
import { Settings } from 'lucide-react';

const NotImplemented = () => {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Module Under Construction" 
        description="We are currently building this feature." 
      />
      <div className="card">
        <EmptyState 
          icon={Settings} 
          title="Feature Not Implemented Yet" 
          message="This module will be available in future updates of AttendX." 
        />
      </div>
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
          
          {/* Workspace Phase Routes */}
          <Route path="/workspaces" element={<ProtectedRoute allowedRoles={['HOD', 'Faculty', 'Student']}><WorkspaceSelection /></ProtectedRoute>} />
          
          <Route path="/attendance/dashboard" element={<ProtectedRoute allowedRoles={['HOD', 'Faculty', 'Student']}><DashboardRouter /></ProtectedRoute>} />
          <Route path="/attendance/academics" element={<ProtectedRoute allowedRoles={['HOD']}><AcademicStructure /></ProtectedRoute>} />
          <Route path="/attendance/students" element={<ProtectedRoute allowedRoles={['HOD']}><StudentManagement /></ProtectedRoute>} />
          <Route path="/attendance/faculty" element={<ProtectedRoute allowedRoles={['HOD']}><FacultyManagement /></ProtectedRoute>} />
          <Route path="/attendance/faculty/:id" element={<ProtectedRoute allowedRoles={['HOD']}><FacultyDetails /></ProtectedRoute>} />
          <Route path="/attendance/my-schedule" element={<ProtectedRoute allowedRoles={['HOD', 'Faculty', 'Student']}><NotImplemented /></ProtectedRoute>} />
          <Route path="/attendance/monitor" element={<ProtectedRoute allowedRoles={['HOD', 'Faculty']}><NotImplemented /></ProtectedRoute>} />
          <Route path="/attendance/my-attendance" element={<ProtectedRoute allowedRoles={['Student']}><NotImplemented /></ProtectedRoute>} />
          <Route path="/attendance/reports" element={<ProtectedRoute allowedRoles={['HOD', 'Faculty']}><NotImplemented /></ProtectedRoute>} />
          <Route path="/attendance/schedule" element={<ProtectedRoute allowedRoles={['Student']}><NotImplemented /></ProtectedRoute>} />

          {/* Smart Timetable Workspace */}
          <Route path="/timetable" element={<Navigate to="/timetable/overview" replace />} />
          <Route path="/timetable/overview" element={<ProtectedRoute allowedRoles={['HOD']}><TimetableOverview /></ProtectedRoute>} />
          <Route path="/timetable/teaching-plan" element={<ProtectedRoute allowedRoles={['HOD']}><TeachingPlan /></ProtectedRoute>} />
          <Route path="/timetable/availability" element={<ProtectedRoute allowedRoles={['HOD']}><Availability /></ProtectedRoute>} />
          <Route path="/timetable/generate" element={<ProtectedRoute allowedRoles={['HOD']}><GenerateTimetable /></ProtectedRoute>} />
          <Route path="/timetable/timetables" element={<ProtectedRoute allowedRoles={['HOD']}><Timetables /></ProtectedRoute>} />

          {/* Legacy Routes Redirects */}
          <Route path="/hod/dashboard" element={<Navigate to="/attendance/dashboard" replace />} />
          <Route path="/hod/academic-structure" element={<Navigate to="/attendance/academics" replace />} />
          <Route path="/hod/student-management" element={<Navigate to="/attendance/students" replace />} />
          <Route path="/hod/faculty-management" element={<Navigate to="/attendance/faculty" replace />} />
          <Route path="/hod/*" element={<Navigate to="/attendance/dashboard" replace />} />

          <Route path="/faculty/dashboard" element={<Navigate to="/attendance/dashboard" replace />} />
          <Route path="/faculty/*" element={<Navigate to="/attendance/dashboard" replace />} />

          <Route path="/student/dashboard" element={<Navigate to="/attendance/dashboard" replace />} />
          <Route path="/student/*" element={<Navigate to="/attendance/dashboard" replace />} />

          {/* Default redirect to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
