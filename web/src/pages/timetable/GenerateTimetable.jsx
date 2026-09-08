import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { CheckCircle, AlertCircle } from 'lucide-react';

const GenerateTimetable = () => {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Generate Timetable" 
        description="Run the AI timetable generator for your selected sections." 
      />

      <div className="card" style={{ padding: '24px', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>SELECT SECTIONS</h3>
        
        <div className="flex flex-col gap-2" style={{ marginBottom: '32px' }}>
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> CSM-A</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> CSM-B</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> CSM-C</label>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>READINESS CHECK</h3>

        <div className="flex flex-col gap-4" style={{ marginBottom: '32px' }}>
          <div className="flex items-center gap-3">
            <CheckCircle size={20} color="var(--success)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Faculty Available</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle size={20} color="var(--success)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Subjects Configured</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} color="var(--warning)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Teaching Plan Incomplete</span>
          </div>
          <div className="flex items-center gap-3">
            <AlertCircle size={20} color="var(--warning)" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>Faculty Availability Pending</span>
          </div>
        </div>

        <button className="btn btn-primary w-full" disabled style={{ opacity: 0.7 }}>
          Generate Timetable (Coming Soon)
        </button>
        <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '12px' }}>
          Complete Required Setup to generate.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default GenerateTimetable;
