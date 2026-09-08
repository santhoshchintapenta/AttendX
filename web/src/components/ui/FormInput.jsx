import React from 'react';

const FormInput = ({ label, error, ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <input 
        className={`form-input ${error ? 'border-red-500' : ''}`} 
        {...props} 
      />
      {error && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default FormInput;
