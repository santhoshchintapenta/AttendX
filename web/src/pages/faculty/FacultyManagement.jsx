import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import DataTable from '../../components/ui/DataTable';
import Badge from '../../components/ui/Badge';
import AddFacultyModal from '../../components/faculty/AddFacultyModal';
import BulkImportModal from '../../components/faculty/BulkImportModal';
import { getFacultyList, deleteFaculty } from '../../services/facultyApi';
import { Search, UserPlus, Filter, ChevronRight, UserCircle, Upload, Edit2, Trash2 } from 'lucide-react';

const FacultyManagement = () => {
  const navigate = useNavigate();
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchFaculty = async () => {
    try {
      setLoading(true);
      const data = await getFacultyList();
      setFaculty(data);
      setError('');
    } catch (err) {
      console.error('Failed to fetch faculty:', err);
      setError('Unable to load faculty list. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this faculty member? This action cannot be undone.')) {
      try {
        await deleteFaculty(id);
        fetchFaculty();
      } catch (err) {
        alert('Failed to delete faculty.');
      }
    }
  };

  // Compute stats
  const totalFaculty = faculty.length;

  // Filter logic
  const filteredFaculty = faculty.filter(f => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = f.user?.name?.toLowerCase().includes(searchLower);
    const idMatch = f.facultyId?.toLowerCase().includes(searchLower);
    const emailMatch = f.user?.email?.toLowerCase().includes(searchLower);
    
    const matchesSearch = nameMatch || idMatch || emailMatch;
    
    const isActive = f.user?.isActive;
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && isActive) || 
      (statusFilter === 'inactive' && !isActive);

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      header: 'Faculty',
      accessor: 'name',
      width: '35%',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate(`/attendance/faculty/${row._id}`)}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '50%', 
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 600, fontSize: '14px'
          }}>
            {row.user?.name?.charAt(0) || <UserCircle size={20} />}
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.user?.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{row.user?.email}</div>
          </div>
        </div>
      )
    },
    {
      header: 'Faculty ID',
      accessor: 'facultyId',
      width: '15%',
      cell: (row) => <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 500 }}>{row.facultyId}</span>
    },
    {
      header: 'Designation',
      accessor: 'designation',
      width: '25%',
      cell: (row) => <span style={{ color: 'var(--text-secondary)' }}>{row.designation}</span>
    },
    {
      header: 'Status',
      accessor: 'status',
      width: '15%',
      cell: (row) => (
        <Badge 
          type={row.user?.isActive ? 'success' : 'error'} 
          text={row.user?.isActive ? 'Active' : 'Inactive'} 
        />
      )
    },
    {
      header: '',
      accessor: 'actions',
      width: '15%',
      cell: (row) => (
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
          <button 
            className="icon-btn" 
            onClick={(e) => { e.stopPropagation(); navigate(`/attendance/faculty/${row._id}`); }}
            title="Edit Faculty"
          >
            <Edit2 size={16} color="var(--text-secondary)" />
          </button>
          <button 
            className="icon-btn" 
            onClick={(e) => handleDelete(e, row._id)}
            title="Delete Faculty"
          >
            <Trash2 size={16} color="#ef4444" />
          </button>
          <button 
            className="icon-btn" 
            onClick={(e) => { e.stopPropagation(); navigate(`/attendance/faculty/${row._id}`); }}
            title="View Details"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <PageHeader 
        title="Faculty Management" 
        subtitle="Manage faculty profiles, designations, and account status."
      />

      <div style={{ padding: '0 32px 32px 32px' }}>
        
        {/* Controls Bar */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          background: 'var(--surface)',
          padding: '16px',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
              <input 
                type="text" 
                placeholder="Search by name, ID, or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', padding: '10px 16px 10px 38px', 
                  border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
                  outline: 'none', fontSize: '14px',
                  transition: 'border-color var(--transition-fast)'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--border)' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>Total Faculty:</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--primary)' }}>{totalFaculty}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '8px' }}>
              <Filter size={16} color="var(--text-secondary)" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ 
                  padding: '8px 32px 8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  outline: 'none', fontSize: '14px',
                  background: 'var(--surface)', cursor: 'pointer',
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 8px center',
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div style={{ position: 'relative' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => setShowAddMenu(!showAddMenu)}
              >
                <UserPlus size={18} />
                Add Faculty ▾
              </button>
              {showAddMenu && (
                <>
                  <div 
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }} 
                    onClick={() => setShowAddMenu(false)} 
                  />
                  <div style={{ 
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0, 
                    background: 'var(--surface)', border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)',
                    width: '200px', zIndex: 11, overflow: 'hidden'
                  }}>
                    <button 
                      onClick={() => { setIsAddModalOpen(true); setShowAddMenu(false); }}
                      style={{ 
                        width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none', borderBottom: '1px solid var(--border)',
                        fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <UserCircle size={16} color="var(--primary)" />
                      Add Single Faculty
                    </button>
                    <button 
                      onClick={() => { setIsBulkModalOpen(true); setShowAddMenu(false); }}
                      style={{ 
                        width: '100%', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'none', border: 'none',
                        fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Upload size={16} color="#10b981" />
                      Bulk Import Faculty
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '24px', padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        {/* Data Table */}
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              Loading faculty records...
            </div>
          ) : (
            <DataTable 
              columns={columns} 
              data={filteredFaculty} 
              keyField="_id"
              emptyMessage={
                searchTerm || statusFilter !== 'all' 
                  ? "No faculty match your search or filter criteria."
                  : "No faculty members have been added to your department yet."
              }
              emptyIcon={UserCircle}
            />
          )}
        </div>

      </div>

      <AddFacultyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSuccess={fetchFaculty}
      />

      <BulkImportModal 
        isOpen={isBulkModalOpen} 
        onClose={() => setIsBulkModalOpen(false)} 
        onSuccess={fetchFaculty}
      />
      
    </DashboardLayout>
  );
};

export default FacultyManagement;
