const xlsx = require('xlsx');

exports.extractMatrices = (fileBuffer) => {
  const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
  const matrices = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    // header: 1 returns a 2D array of rows and columns, preserving empty cells as null/undefined
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
    
    // Filter out completely empty rows to save processing time
    const cleanedData = rawData.filter(row => row && row.some(cell => cell !== null && String(cell).trim() !== ''));
    
    if (cleanedData.length > 0) {
      matrices.push({
        sheetName,
        data: cleanedData
      });
    }
  }

  return matrices;
};
