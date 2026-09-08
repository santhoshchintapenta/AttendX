import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { Activity, BookOpen, Calendar } from 'lucide-react';

const StudentDashboard = () => {
  return (
    <DashboardLayout>
      <PageHeader title="Overview" description="Track your academic progress." />
      
      <div className="grid-cols-3 mb-6">
        <StatCard title="Overall Attendance" value="--" icon={Activity} />
        <StatCard title="Classes Attended" value="--" icon={BookOpen} />
        <StatCard title="Total Classes" value="--" icon={Calendar} />
      </div>

      <div className="grid-cols-2 mb-6">
        <div className="card">
          <h3 className="card-title mb-6">Today's Schedule</h3>
          <EmptyState message="No schedule available yet." icon={Calendar} />
        </div>

        <div className="card">
          <h3 className="card-title mb-6">Attendance Status</h3>
          <EmptyState message="No attendance data available yet." icon={Activity} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
