import React from 'react';
import { ChevronRight } from 'lucide-react';

const ActionCard = ({ title, description, icon: Icon, onClick }) => {
  return (
    <button className="action-card" onClick={onClick}>
      <div className="action-card-left">
        {Icon && (
          <div className="action-card-icon">
            <Icon size={24} className="text-primary" />
          </div>
        )}
        <div className="action-card-text">
          <h4 className="action-card-title">{title}</h4>
          {description && <p className="action-card-desc">{description}</p>}
        </div>
      </div>
      <ChevronRight size={20} className="text-muted" />
    </button>
  );
};

export default ActionCard;
