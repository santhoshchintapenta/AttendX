const User = require('../../models/User');
const Student = require('../../models/Student');
const Section = require('../../models/Section');

exports.validate = async (rawStudents, department) => {
  const departmentSections = await Section.find({ department });
  
  const existingStudents = await Student.find({ department }).select('rollNumber email');
  const existingUsers = await User.find({ department }).select('email');
  
  const dbRollNumbers = new Set(existingStudents.map(s => s.rollNumber.toLowerCase()));
  const dbEmails = new Set();
  existingStudents.forEach(s => { if (s.email) dbEmails.add(s.email.toLowerCase()) });
  existingUsers.forEach(u => { if (u.email) dbEmails.add(u.email.toLowerCase()) });

  const valid = [];
  const duplicates = [];
  const invalid = [];

  const inFileRollNumbers = new Set();
  const inFileEmails = new Set();
  const uniqueNewSections = new Set();

  for (const record of rawStudents) {
    let isInvalid = false;
    let invalidReason = '';

    // Required fields validation
    if (!record.fullName || !record.rollNumber || !record.year || !record.semester || !record.sectionName) {
      isInvalid = true;
      invalidReason = 'Missing required fields (Name, Roll, Year, Sem, or Section)';
    } else if (isNaN(record.year) || ![1, 2, 3, 4].includes(record.year)) {
      isInvalid = true;
      invalidReason = 'Invalid Year (must be 1-4)';
    } else if (isNaN(record.semester) || ![1, 2].includes(record.semester)) {
      isInvalid = true;
      invalidReason = 'Invalid Semester (must be 1-2)';
    } else if (record.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(record.email)) {
        isInvalid = true;
        invalidReason = 'Invalid email format';
      }
    }

    // Section mapping and authorization
    if (!isInvalid) {
      // Find section by exact match of year, semester, and normalized section name
      const matchedSection = departmentSections.find(
        s => s.year === record.year && 
             s.semester === record.semester && 
             s.sectionName.toUpperCase() === record.sectionName.toUpperCase()
      );
      if (!matchedSection) {
        record.isNewSection = true;
        const cacheKey = `${record.year}_${record.semester}_${record.sectionName.toUpperCase()}`;
        uniqueNewSections.add(cacheKey);
      } else {
        record.sectionId = matchedSection._id;
        record.isNewSection = false;
      }
    }

    if (isInvalid) {
      record.status = 'Invalid';
      record.reason = invalidReason;
      invalid.push(record);
      continue;
    }

    // Duplicate detection
    let isDuplicate = false;
    let dupReason = '';

    if (dbRollNumbers.has(record.rollNumber.toLowerCase())) {
      isDuplicate = true;
      dupReason = 'Roll Number already exists in database';
    } else if (dbEmails.has(record.finalEmail)) {
      isDuplicate = true;
      dupReason = record.email ? 'Email already exists in database' : 'Generated placeholder email conflict in database';
    } else if (inFileRollNumbers.has(record.rollNumber.toLowerCase())) {
      isDuplicate = true;
      dupReason = 'Duplicate Roll Number found in uploaded file';
    } else if (inFileEmails.has(record.finalEmail)) {
      isDuplicate = true;
      dupReason = record.email ? 'Duplicate Email found in uploaded file' : 'Generated placeholder email conflict inside file';
    }

    if (isDuplicate) {
      record.status = 'Duplicate';
      record.reason = dupReason;
      duplicates.push(record);
    } else {
      record.status = 'Valid';
      inFileRollNumbers.add(record.rollNumber.toLowerCase());
      inFileEmails.add(record.finalEmail);
      valid.push(record);
    }
  }

  return { valid, duplicates, invalid, newSectionsCount: uniqueNewSections.size };
};
