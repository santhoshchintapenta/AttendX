import React from 'react';

const Select = ({ label, options, error, ...props }) => {
  return (
    <div className="form-group">
      {label && <label className="form-label">{label}</label>}
      <select 
        className={`form-input ${error ? 'border-red-500' : ''}`} 
        {...props}
      >
        {options.map((opt, index) => (
          <option key={index} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span style={{ color: 'var(--error)', fontSize: '12px', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  );
};

export default Select;
