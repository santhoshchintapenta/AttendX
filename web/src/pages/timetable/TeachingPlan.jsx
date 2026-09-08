import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';

const TeachingPlan = () => {
  return (
    <DashboardLayout>
      <PageHeader 
        title="Teaching Plan" 
        description="Assign faculty to subjects and define classes per week." 
      />

      <div className="card" style={{ padding: '24px' }}>
        <div className="grid-cols-3" style={{ marginBottom: '24px' }}>
          <div className="form-group">
            <label className="form-label">Year</label>
            <select className="form-input">
              <option value="">Select Year</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Semester</label>
            <select className="form-input">
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Section</label>
            <select className="form-input">
              <option value="">Select Section</option>
              <option value="CSM-A">CSM-A</option>
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Section: CSM-A</h3>
        
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Assigned Faculty</th>
                <th>Weekly Hours</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data Structures</td>
                <td>
                  <select className="form-input" style={{ padding: '6px 12px', height: '36px' }}>
                    <option value="">Select Faculty</option>
                  </select>
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>Machine Learning</td>
                <td>
                  <select className="form-input" style={{ padding: '6px 12px', height: '36px' }}>
                    <option value="">Select Faculty</option>
                  </select>
                </td>
                <td>—</td>
              </tr>
              <tr>
                <td>Computer Networks</td>
                <td>
                  <select className="form-input" style={{ padding: '6px 12px', height: '36px' }}>
                    <option value="">Select Faculty</option>
                  </select>
                </td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeachingPlan;
