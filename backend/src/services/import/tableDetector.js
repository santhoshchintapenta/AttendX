const headerNormalizer = require('./headerNormalizer');

exports.findTables = (matrices) => {
  const tables = [];

  for (const matrixObj of matrices) {
    const { sheetName, data } = matrixObj;

    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      const mappedHeaders = headerNormalizer.mapHeaders(row);
      
      // Find all indices that resolve to 'rollNumber'
      const rollIndices = mappedHeaders.map((h, i) => h === 'rollNumber' ? i : -1).filter(i => i !== -1);
      
      if (rollIndices.length > 0) {
        // For each rollIndex, define a table boundary
        for (let t = 0; t < rollIndices.length; t++) {
          const startCol = t === 0 ? 0 : rollIndices[t];
          const endCol = t < rollIndices.length - 1 ? rollIndices[t+1] - 1 : row.length - 1;
          
          const chunkHeaders = mappedHeaders.slice(startCol, endCol + 1);
          
          // A valid table needs at least a Roll Number and Full Name
          if (chunkHeaders.includes('fullName')) {
            const tableRows = [];
            
            // Extract rows for this table until we hit an empty row or a new header
            for (let tr = r + 1; tr < data.length; tr++) {
              const dataRow = data[tr].slice(startCol, endCol + 1);
              
              // Stop if we see another header row indicating a new table vertically
              const mappedDataRowHeaders = headerNormalizer.mapHeaders(dataRow);
              if (mappedDataRowHeaders.includes('rollNumber')) {
                break;
              }
              
              // Only include rows that have actual data
              if (dataRow.some(c => c !== null && String(c).trim() !== '')) {
                const record = { _sheetName: sheetName, _rowIndex: tr + 1 };
                for (let c = 0; c < chunkHeaders.length; c++) {
                  const key = chunkHeaders[c];
                  if (key) {
                    record[key] = dataRow[c] || '';
                  }
                }
                tableRows.push(record);
              }
            }
            
            if (tableRows.length > 0) {
              tables.push({
                sheetName,
                headers: chunkHeaders.filter(h => h !== null),
                records: tableRows,
                headerRowIndex: r
              });
            }
          }
        }
      }
    }
  }

  return tables;
};
