import React from 'react';

const Badge = ({ children, variant = 'gray' }) => {
  return (
    <span className={`badge badge-${variant}`}>
      {children}
    </span>
  );
};

export default Badge;
