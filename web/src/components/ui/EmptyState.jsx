import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ title, message, icon: Icon }) => {
  const DisplayIcon = Icon || Search;
  
  return (
    <div className="empty-state">
      <div className="empty-state-icon-wrapper">
        <DisplayIcon size={48} className="text-muted" strokeWidth={1.5} />
      </div>
      <h3 className="empty-state-title">{title || 'No data found'}</h3>
      <p className="empty-state-message">{message}</p>
    </div>
  );
};

export default EmptyState;
