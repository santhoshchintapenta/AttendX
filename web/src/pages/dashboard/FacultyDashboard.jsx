import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { Calendar, Users, Activity } from 'lucide-react';

const FacultyDashboard = () => {
  return (
    <DashboardLayout>
      <PageHeader title="Overview" description="Manage your classes and students." />
      
      <div className="grid-cols-3 mb-6">
        <StatCard title="Classes Today" value="0" icon={Calendar} />
        <StatCard title="Pending Attendance" value="0" icon={Activity} />
        <StatCard title="Assigned Students" value="0" icon={Users} />
      </div>

      <div className="grid-cols-2 mb-6">
        <div className="card">
          <h3 className="card-title mb-6">Today's Schedule</h3>
          <EmptyState message="No classes scheduled for today." icon={Calendar} />
        </div>

        <div className="card">
          <h3 className="card-title mb-6">Attendance Status</h3>
          <EmptyState message="No attendance data available yet." icon={Activity} />
        </div>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-primary">Mark Attendance</button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FacultyDashboard;
