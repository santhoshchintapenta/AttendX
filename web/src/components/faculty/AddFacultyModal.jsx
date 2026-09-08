import React, { useState } from 'react';
import Modal from '../ui/Modal';
import FormInput from '../ui/FormInput';
import { addFaculty } from '../../services/facultyApi';
import { Copy, Check, AlertTriangle } from 'lucide-react';

const AddFacultyModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    designation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Success state UI variables
  const [successData, setSuccessData] = useState(null); // { email, temporaryPassword }
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await addFaculty(formData);
      if (response.success) {
        setSuccessData({
          email: formData.email,
          temporaryPassword: response.temporaryPassword
        });
        // We do NOT close the modal yet, so the user can see the password.
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to create faculty member. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (successData?.temporaryPassword) {
      await navigator.clipboard.writeText(successData.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', phone: '', designation: '' });
    setSuccessData(null);
    setCopied(false);
    setError('');
    onClose();
  };

  // -----------------------------------------------------
  // SUCCESS STATE RENDER
  // -----------------------------------------------------
  if (successData) {
    return (
      <Modal 
        isOpen={isOpen} 
        onClose={handleClose} 
        title="Faculty Created Successfully" 
        maxWidth="450px"
      >
        <div style={{ textAlign: 'center', padding: '16px 0' }}>
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Email:</span>
            <div style={{ fontWeight: 600, fontSize: '16px', color: 'var(--text-primary)' }}>
              {successData.email}
            </div>
          </div>

          <div style={{ 
            background: 'var(--surface)', 
            border: '1px solid var(--border)', 
            padding: '24px', 
            borderRadius: 'var(--radius-lg)',
            marginBottom: '24px'
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
              Temporary Password:
            </span>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px',
              fontFamily: 'monospace',
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--primary)',
              letterSpacing: '2px'
            }}>
              {successData.temporaryPassword}
              <button 
                onClick={handleCopy}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  color: copied ? '#10b981' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                title="Copy password"
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'flex-start', 
            gap: '12px', 
            padding: '16px', 
            background: '#fffbeb', 
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            color: '#92400e',
            textAlign: 'left'
          }}>
            <AlertTriangle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
              <strong>Copy and share this password securely.</strong><br/>
              It will not be shown again.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
          <button className="btn btn-primary" onClick={handleClose} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </Modal>
    );
  }

  // -----------------------------------------------------
  // FORM RENDER
  // -----------------------------------------------------
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title="Add New Faculty"
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
            placeholder="e.g. Dr. Ravi Kumar"
          />
          <FormInput
            label="Phone Number (Optional)"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +91 9876543210"
          />
          <div style={{ gridColumn: '1 / -1' }}>
            <FormInput
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="faculty@college.edu"
            />
          </div>
        </div>

        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
          Professional Information
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '32px' }}>
          <FormInput
            label="Designation (Optional)"
            name="designation"
            value={formData.designation}
            onChange={handleChange}
            placeholder="e.g. Assistant Professor"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Faculty'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddFacultyModal;
