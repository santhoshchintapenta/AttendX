import React from 'react';
import EmptyState from './EmptyState';

const DataTable = ({ columns, data, keyField, emptyMessage, emptyIcon }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-8">
        <EmptyState 
          message={emptyMessage || "No records found."} 
          icon={emptyIcon}
        />
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} style={{ width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row[keyField] || rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
