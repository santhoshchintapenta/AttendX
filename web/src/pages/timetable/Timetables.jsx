import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import EmptyState from '../../components/ui/EmptyState';
import PageHeader from '../../components/ui/PageHeader';
import { FileBarChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Timetables = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <PageHeader 
        title="Published Timetables" 
        description="View and manage generated department schedules." 
      />

      <div className="card">
        <EmptyState 
          icon={FileBarChart} 
          title="No Timetables Generated" 
          message="Complete your Teaching Plan and Availability configuration to generate your first timetable." 
          action={{ label: 'Go to Teaching Plan', onClick: () => navigate('/timetable/teaching-plan') }}
        />
      </div>
    </DashboardLayout>
  );
};

export default Timetables;
