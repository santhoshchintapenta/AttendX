const metadataExtractor = require('./metadataExtractor');

exports.normalize = (tables, matrices, overrides) => {
  const students = [];
  let detectedMetadata = { year: null, semester: null, section: null };

  for (const table of tables) {
    const matrixObj = matrices.find(m => m.sheetName === table.sheetName);
    const inferred = metadataExtractor.inferMetadata(matrixObj.data, table.headerRowIndex, table.sheetName);
    
    // Save the first reasonably complete metadata inference for the global preview UI
    if (!detectedMetadata.year && inferred.year) detectedMetadata.year = inferred.year;
    if (!detectedMetadata.semester && inferred.semester) detectedMetadata.semester = inferred.semester;
    if (!detectedMetadata.section && inferred.section) detectedMetadata.section = inferred.section;

    for (const raw of table.records) {
      // Priority: Overrides > Explicit Column Value > Inferred Context Value
      const yearStr = overrides?.year || raw.year || inferred.year || '';
      const semesterStr = overrides?.semester || raw.semester || inferred.semester || '';
      const sectionName = overrides?.section || raw.section || inferred.section || '';
      
      const rawEmail = String(raw.email || '').trim().toLowerCase();
      const rollNumber = String(raw.rollNumber || '').trim();
      
      let confidence = 'HIGH';
      if (!raw.fullName || !rollNumber) {
        confidence = 'LOW';
      } else if (!raw.year && !raw.semester && !raw.section) {
        // Relied entirely on metadata inference or overrides
        confidence = 'MEDIUM';
      }

      students.push({
        rowNumber: raw._rowIndex,
        sheetName: raw._sheetName,
        fullName: String(raw.fullName || '').trim(),
        rollNumber,
        email: rawEmail,
        finalEmail: rawEmail ? rawEmail : `${rollNumber.toLowerCase()}@student.attendx.local`,
        phoneNumber: String(raw.phoneNumber || '').trim(),
        year: parseInt(yearStr, 10),
        semester: parseInt(semesterStr, 10),
        sectionName: String(sectionName).trim(),
        sectionId: null,
        confidence,
        status: null,
        reason: null
      });
    }
  }

  return { students, detectedMetadata };
};
