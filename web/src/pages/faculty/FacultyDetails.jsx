import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import EditFacultyModal from '../../components/faculty/EditFacultyModal';
import AssignSubjectsModal from '../../components/faculty/AssignSubjectsModal';
import { getFacultyById, getFacultySubjects, updateFacultyStatus } from '../../services/facultyApi';
import { ArrowLeft, UserCircle, Mail, Phone, Building, Briefcase, BookOpen, Edit2, Settings, ShieldAlert, CheckCircle } from 'lucide-react';

const FacultyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [faculty, setFaculty] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const fetchFacultyDetails = async () => {
    try {
      setLoading(true);
      const data = await getFacultyById(id);
      setFaculty(data);
      
      const subs = await getFacultySubjects(id);
      setSubjects(subs);
      
      setError('');
    } catch (err) {
      console.error('Failed to fetch faculty details:', err);
      setError('Unable to load faculty profile. They may have been removed or you do not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchFacultyDetails();
    }
  }, [id]);

  const handleToggleStatus = async () => {
    try {
      const newStatus = !faculty.user?.isActive;
      await updateFacultyStatus(faculty._id, newStatus);
      setFaculty({
        ...faculty,
        user: { ...faculty.user, isActive: newStatus }
      });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  if (error || !faculty) {
    return (
      <DashboardLayout>
        <div style={{ padding: '32px' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/attendance/faculty')} style={{ marginBottom: '24px' }}>
            <ArrowLeft size={16} /> Back to Faculty
          </button>
          <div className="alert alert-error" style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
            {error || 'Faculty not found.'}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ padding: '32px', maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Back Navigation */}
        <button 
          onClick={() => navigate('/attendance/faculty')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            fontSize: '14px', fontWeight: 500, cursor: 'pointer', marginBottom: '24px',
            padding: '4px 8px', marginLeft: '-8px', borderRadius: 'var(--radius-md)',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--surface-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ArrowLeft size={16} /> Back to Faculty Management
        </button>

        {/* Profile Header Card */}
        <div style={{ 
          background: 'var(--surface)', 
          border: '1px solid var(--border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: '32px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', 
              background: 'var(--primary-light)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '32px', flexShrink: 0
            }}>
              {faculty.user?.name?.charAt(0) || <UserCircle size={40} />}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {faculty.user?.name}
                <Badge type={faculty.user?.isActive ? 'success' : 'error'} text={faculty.user?.isActive ? 'Active' : 'Inactive'} />
              </h1>
              <p style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                {faculty.designation}
              </p>
              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-tertiary)', fontSize: '13px', fontWeight: 500 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldAlert size={14}/> ID: {faculty.facultyId}</span>
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-secondary" onClick={() => setIsEditModalOpen(true)}>
              <Edit2 size={16} /> Edit Faculty
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleToggleStatus}
              style={{ color: faculty.user?.isActive ? '#dc2626' : '#10b981', borderColor: faculty.user?.isActive ? '#fca5a5' : '#6ee7b7' }}
            >
              <Settings size={16} />
              {faculty.user?.isActive ? 'Deactivate' : 'Activate'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '24px' }}>
          
          {/* Personal Information */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
              Personal Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <UserCircle size={18} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Full Name</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{faculty.user?.name}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Mail size={18} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Email Address</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{faculty.user?.email}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Phone size={18} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Phone Number</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{faculty.phone || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px' }}>
              Professional Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Briefcase size={18} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Faculty ID</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, fontFamily: 'monospace' }}>{faculty.facultyId}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <Building size={18} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Department</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>Assigned to HOD Dept</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <ShieldAlert size={18} color="var(--text-tertiary)" style={{ marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>Designation</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{faculty.designation}</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Can Teach (Subjects) */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Subjects They Can Teach
            </h3>
            <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(true)}>
              <BookOpen size={16} /> Manage Subjects
            </button>
          </div>
          
          {subjects.length === 0 ? (
            <div style={{ padding: '24px' }}>
              <EmptyState 
                message="No subjects have been assigned to this faculty member yet." 
                icon={BookOpen}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              {subjects.map(sub => (
                <div key={sub._id} style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  padding: '8px 16px', background: 'var(--background)', 
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-full)',
                  fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)'
                }}>
                  <CheckCircle size={16} color="var(--primary)" />
                  {sub.subject?.subjectName}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <EditFacultyModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        faculty={faculty}
        onSuccess={fetchFacultyDetails}
      />

      <AssignSubjectsModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        facultyId={faculty._id}
        currentMappings={subjects}
        onSuccess={fetchFacultyDetails}
      />
      
    </DashboardLayout>
  );
};

export default FacultyDetails;
