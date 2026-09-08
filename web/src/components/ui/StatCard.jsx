import React from 'react';

const StatCard = ({ title, value, icon: Icon, trend }) => {
  return (
    <div className="card stat-card-premium">
      <div className="stat-card-header">
        <h3 className="stat-title">{title}</h3>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={20} className="text-primary" />
          </div>
        )}
      </div>
      
      <div className="stat-card-content">
        <div className="stat-value">{value}</div>
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'text-success' : 'text-error'}`}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
