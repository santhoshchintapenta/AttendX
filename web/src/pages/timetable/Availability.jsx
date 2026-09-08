import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';

const Availability = () => {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Availability Settings" 
        description="Configure institutional working hours and faculty constraints." 
      />

      <div className="grid-cols-2">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Department Settings</h3>
          
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px' }}>Working Days</h4>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Monday</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Tuesday</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Wednesday</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Thursday</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Friday</label>
              <label className="flex items-center gap-2"><input type="checkbox" readOnly /> Saturday</label>
            </div>
          </div>

          <div className="grid-cols-2" style={{ marginBottom: '24px', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input type="time" className="form-input" defaultValue="09:00" />
            </div>
            <div className="form-group">
              <label className="form-label">End Time</label>
              <input type="time" className="form-input" defaultValue="16:30" />
            </div>
          </div>

          <div className="grid-cols-2" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Periods Per Day</label>
              <input type="number" className="form-input" defaultValue="7" />
            </div>
            <div className="form-group">
              <label className="form-label">Period Duration (Mins)</label>
              <input type="number" className="form-input" defaultValue="50" />
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '24px' }}>Faculty Availability</h3>
          <p className="body-text" style={{ marginBottom: '16px' }}>
            Select a faculty member to configure their specific unavailable periods or days off.
          </p>
          <div className="form-group">
            <select className="form-input">
              <option value="">Select Faculty...</option>
              <option value="1">Dr. Kumar</option>
            </select>
          </div>
          <div style={{ padding: '16px', backgroundColor: 'var(--background-hover)', borderRadius: '8px', textAlign: 'center' }}>
            <p className="body-text">Faculty specific constraints will be configured here.</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Availability;
