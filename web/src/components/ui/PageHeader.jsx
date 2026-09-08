import React from 'react';

const PageHeader = ({ title, description, actions }) => {
  return (
    <div className="page-header flex justify-between items-start">
      <div>
        <h2 className="page-title">{title}</h2>
        {description && <p className="body-text">{description}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
