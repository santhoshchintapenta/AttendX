exports.inferMetadata = (matrixData, headerRowIndex, sheetName) => {
  let inferredYear = null;
  let inferredSemester = null;
  let inferredSection = null;

  // Combine sheet name and all rows ABOVE the table header into a single string for analysis
  const topRows = matrixData.slice(0, headerRowIndex).map(row => row.join(' ')).join(' ');
  const allText = `${sheetName} ${topRows}`;

  // Year: "4th Year", "IV Year", "4/4"
  const yearMatch = allText.match(/(1|2|3|4)(?:st|nd|rd|th|\/4)\s*year/i) || allText.match(/year\s*[-:]?\s*(1|2|3|4)/i);
  if (yearMatch) inferredYear = parseInt(yearMatch[1], 10);
  else if (allText.match(/IV Year/i)) inferredYear = 4;
  else if (allText.match(/III Year/i)) inferredYear = 3;
  else if (allText.match(/II Year/i)) inferredYear = 2;
  else if (allText.match(/I Year/i)) inferredYear = 1;

  // Semester: "SEM 1", "SEM-I", "Semester 1", "Semester I"
  const semMatch = allText.match(/sem(?:ester)?\s*[-:\s]?\s*(1|2|I|II)\b/i);
  if (semMatch) {
    const s = semMatch[1].toUpperCase();
    if (s === '1' || s === 'I') inferredSemester = 1;
    if (s === '2' || s === 'II') inferredSemester = 2;
  }

  // Section: "CSM-A", "CSM - B", "Section A", "Section: A"
  // Looks for standalone single uppercase letter or typical hyphenated section formats
  const secMatch = allText.match(/(?:section|sec|class)\s*[-:\s]?\s*([A-Za-z0-9]+)\b/i) || allText.match(/\b([A-Z]{2,4}\s*[-]?\s*[A-Z0-9]{1,2})\b/);
  if (secMatch) {
    // Preserve exact case as much as possible but usually sections are uppercase
    inferredSection = secMatch[1].replace(/\s+/g, '').toUpperCase();
  }

  return { year: inferredYear, semester: inferredSemester, section: inferredSection };
};
