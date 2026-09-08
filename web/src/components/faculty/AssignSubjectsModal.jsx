import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { assignFacultySubjects } from '../../services/facultyApi';
import { getSubjects } from '../../services/academicApi';
import { Search } from 'lucide-react';

const AssignSubjectsModal = ({ isOpen, onClose, facultyId, currentMappings, onSuccess }) => {
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchAvailableSubjects();
      // Initialize selected set with current mappings
      const initialIds = currentMappings.map(m => m.subject?._id || m.subject);
      setSelectedSubjectIds(new Set(initialIds));
    }
  }, [isOpen, currentMappings]);

  const fetchAvailableSubjects = async () => {
    try {
      setFetching(true);
      // academicApi.getSubjects automatically fetches for the HOD's department based on backend auth
      const subjects = await getSubjects();
      setAvailableSubjects(subjects);
      setError('');
    } catch (err) {
      setError('Unable to load subjects. Please try again.');
    } finally {
      setFetching(false);
    }
  };

  const handleToggleSubject = (subjectId) => {
    const newSelected = new Set(selectedSubjectIds);
    if (newSelected.has(subjectId)) {
      newSelected.delete(subjectId);
    } else {
      newSelected.add(subjectId);
    }
    setSelectedSubjectIds(newSelected);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const subjectIdsArray = Array.from(selectedSubjectIds);
      await assignFacultySubjects(facultyId, subjectIdsArray);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to assign subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = availableSubjects.filter(sub => 
    sub.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.subjectCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Assign Subjects"
      maxWidth="500px"
    >
      {error && (
        <div className="alert alert-error" style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
        <input 
          type="text" 
          placeholder="Search subjects..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ 
            width: '100%', padding: '10px 16px 10px 36px', 
            border: '1px solid var(--border)', borderRadius: 'var(--radius-md)',
            outline: 'none', fontSize: '14px'
          }}
        />
      </div>

      <div style={{ 
        border: '1px solid var(--border)', 
        borderRadius: 'var(--radius-md)', 
        maxHeight: '300px', 
        overflowY: 'auto',
        background: 'var(--background)'
      }}>
        {fetching ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading subjects...</div>
        ) : filteredSubjects.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No subjects found.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredSubjects.map(sub => (
              <label 
                key={sub._id} 
                style={{ 
                  display: 'flex', alignItems: 'center', gap: '12px', 
                  padding: '12px 16px', borderBottom: '1px solid var(--border)',
                  cursor: 'pointer', transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-hover, #f8fafc)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <input 
                  type="checkbox" 
                  checked={selectedSubjectIds.has(sub._id)}
                  onChange={() => handleToggleSubject(sub._id)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>{sub.subjectName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Code: {sub.subjectCode} • Year {sub.year} • Sem {sub.semester}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading || fetching}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  );
};

export default AssignSubjectsModal;
