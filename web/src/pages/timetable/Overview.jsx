import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/ui/StatCard';
import PageHeader from '../../components/ui/PageHeader';
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Overview = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader 
        title="Department Timetable Setup" 
        description="Configure and monitor your timetable generation readiness." 
      />

      <div className="stat-grid" style={{ marginBottom: '32px' }}>
        <StatCard title="Faculty" value="0 Available" />
        <StatCard title="Sections" value="0 Available" />
        <StatCard title="Subjects" value="0 Available" />
        <StatCard title="Assignments" value="Pending" />
      </div>

      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>TIMETABLE READINESS</h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} color="var(--success)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Academic Structure Complete</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={20} color="var(--success)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Faculty Added</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} color="var(--warning)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Faculty Assignments Pending</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} color="var(--warning)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Availability Not Configured</span>
          </div>
        </div>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          <h4 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>NEXT STEP</h4>
          <button 
            className="btn btn-primary flex items-center gap-2"
            onClick={() => navigate('/timetable/teaching-plan')}
          >
            Complete Teaching Plan <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Overview;
