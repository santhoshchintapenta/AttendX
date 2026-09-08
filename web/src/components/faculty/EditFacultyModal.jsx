import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import { updateFaculty } from '../../services/facultyApi';

const EditFacultyModal = ({ isOpen, onClose, faculty, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    facultyId: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (faculty && isOpen) {
      setFormData({
        name: faculty.user?.name || '',
        email: faculty.user?.email || '',
        phone: faculty.phone || '',
        facultyId: faculty.facultyId || '',
        designation: faculty.designation || ''
      });
      setError('');
    }
  }, [faculty, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await updateFaculty(faculty._id, formData);
      if (onSuccess) onSuccess(response);
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to update faculty member. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Edit Faculty Profile"
      maxWidth="600px"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '16px', padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          Personal Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <FormInput
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          Professional Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
          <FormInput
            label="Faculty ID"
            name="facultyId"
            value={formData.facultyId}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Designation"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditFacultyModal;
