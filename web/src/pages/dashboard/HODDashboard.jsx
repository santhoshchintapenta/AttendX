import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import EmptyState from '../../components/ui/EmptyState';
import ActionCard from '../../components/ui/ActionCard';
import PageHeader from '../../components/ui/PageHeader';
import { getHODStats } from '../../services/dashboardApi';
import { Users, UserCircle, BookOpen, Clock, Activity, Calendar } from 'lucide-react';

const HODDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    totalStudents: '—',
    totalFaculty: '—',
    todayClasses: '—',
    overallAttendance: '—'
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getHODStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Department Overview" 
        description="Monitor key metrics and manage department operations." 
      />
      
      <div className="grid-cols-4 mb-6">
        <StatCard title="Total Students" value={stats.totalStudents} icon={Users} />
        <StatCard title="Total Faculty" value={stats.totalFaculty} icon={UserCircle} />
        <StatCard title="Today's Classes" value={stats.todayClasses} icon={Calendar} />
        <StatCard title="Overall Attendance" value={stats.overallAttendance} icon={Activity} />
      </div>

      <div className="grid-cols-3 mb-6">
        <div style={{ gridColumn: 'span 2' }} className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="card-title">Recent Activity</h3>
            <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }}>View All</button>
          </div>
          <EmptyState 
            icon={Clock} 
            title="No recent activity" 
            message="Activity across the department will appear here." 
          />
        </div>

        <div className="card">
          <h3 className="card-title mb-6">Quick Actions</h3>
          <div className="flex-col gap-4">
            <ActionCard 
              title="Academic Structure" 
              description="Manage sections and subjects"
              icon={BookOpen}
              onClick={() => navigate('/attendance/academics')}
            />
            <ActionCard 
              title="Manage Students" 
              description="Add or edit student details"
              icon={Users}
              onClick={() => navigate('/attendance/students')}
            />
            <ActionCard 
              title="Manage Faculty" 
              description="Assign subjects to faculty"
              icon={UserCircle}
              onClick={() => navigate('/attendance/faculty')}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default HODDashboard;
