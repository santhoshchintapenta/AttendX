const xlsx = require('xlsx');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const { generateFacultyId, generateTempPassword, determineFacultyRole } = require('./facultyController');

const normalizePhone = (phone) => {
  if (phone === null || phone === undefined) return '';
  let strPhone = String(phone).trim();
  if (strPhone.endsWith('.0')) {
    strPhone = strPhone.slice(0, -2);
  }
  return strPhone;
};

const getColumnMap = (headers) => {
  const map = {
    name: -1,
    email: -1,
    designation: -1,
    phone: -1
  };
  
  headers.forEach((h, index) => {
    if (!h) return;
    const lowerHeader = String(h).toLowerCase().trim();
    if (lowerHeader === 'name') map.name = index;
    else if (lowerHeader === 'email id' || lowerHeader === 'email' || lowerHeader === 'emailid') map.email = index;
    else if (lowerHeader === 'designation') map.designation = index;
    else if (lowerHeader === 'phone number' || lowerHeader === 'phone' || lowerHeader === 'phonenumber') map.phone = index;
  });
  
  return map;
};

exports.previewUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    
    const rows = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    if (rows.length < 2) {
      return res.status(400).json({ success: false, message: 'File is empty or contains only headers' });
    }

    const headers = rows[0];
    const columnMap = getColumnMap(headers);
    
    if (columnMap.name === -1 || columnMap.email === -1) {
      return res.status(400).json({ success: false, message: 'Missing required columns: Name, Email ID' });
    }

    // Pre-fetch all user emails in the DB to check duplicates quickly
    const existingUsers = await User.find({}, 'email').lean();
    const existingEmails = new Set(existingUsers.map(u => u.email.toLowerCase()));
    
    const fileEmails = new Set();
    const processedRows = [];
    let validCount = 0;
    let invalidCount = 0;
    
    // We will generate sequential IDs for preview but without writing to DB.
    // However, if multiple uploads happen, or if they decide not to import, IDs will just start from current max.
    const year = new Date().getFullYear();
    const prefix = `FAC-${year}-`;
    const lastFaculty = await Faculty.findOne({ facultyId: { $regex: `^${prefix}` } })
      .sort({ facultyId: -1 })
      .collation({ locale: "en_US", numericOrdering: true });
      
    let nextSequence = 1;
    if (lastFaculty && lastFaculty.facultyId) {
      const parts = lastFaculty.facultyId.split('-');
      const lastSequence = parseInt(parts[2], 10);
      if (!isNaN(lastSequence)) nextSequence = lastSequence + 1;
    }

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      // Skip completely empty rows
      if (row.length === 0 || row.every(cell => cell === '' || cell === null)) continue;
      
      const name = String(row[columnMap.name] || '').trim();
      const email = String(row[columnMap.email] || '').trim();
      const designation = columnMap.designation !== -1 ? String(row[columnMap.designation] || '').trim() : '';
      const rawPhone = columnMap.phone !== -1 ? row[columnMap.phone] : '';
      const phone = normalizePhone(rawPhone);

      const errors = [];
      let status = 'valid';

      if (!name) {
        errors.push('Name is required');
        status = 'invalid';
      }
      
      if (!email) {
        errors.push('Email is required');
        status = 'invalid';
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          errors.push('Invalid email format');
          status = 'invalid';
        } else if (existingEmails.has(email.toLowerCase())) {
          errors.push('Email already exists in system');
          status = 'invalid';
        } else if (fileEmails.has(email.toLowerCase())) {
          errors.push('Duplicate email within file');
          status = 'invalid';
        } else {
          fileEmails.add(email.toLowerCase());
        }
      }

      let assignedFacultyId = '';
      if (status === 'valid') {
        assignedFacultyId = `${prefix}${String(nextSequence).padStart(3, '0')}`;
        nextSequence++;
        validCount++;
      } else {
        invalidCount++;
      }

      processedRows.push({
        rowNumber: i + 1,
        name,
        email,
        designation,
        phone,
        facultyId: assignedFacultyId,
        systemRole: exports.determineFacultyRole ? exports.determineFacultyRole(designation) : determineFacultyRole(designation),
        status,
        errors
      });
    }

    res.status(200).json({
      success: true,
      data: {
        totalRows: processedRows.length,
        validRows: validCount,
        invalidRows: invalidCount,
        rows: processedRows
      }
    });

  } catch (error) {
    console.error('Error in bulk import preview:', error);
    res.status(500).json({ success: false, message: 'Server error processing file preview' });
  }
};

exports.importFaculty = async (req, res) => {
  try {
    const { rows } = req.body;
    const department = req.user.department; // Authenticated HOD's department

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid rows provided for import' });
    }

    const successful = [];
    const failed = [];

    for (const row of rows) {
      const { name, email, designation, phone } = row;
      let assignedFacultyId = row.facultyId;

      try {
        // Re-validate required
        if (!name || !email) {
          throw new Error('Name and email are required');
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('Email already exists');
        }

        // Use the generated ID or fallback to generate
        if (!assignedFacultyId) {
          assignedFacultyId = await generateFacultyId();
        } else {
          const existingFaculty = await Faculty.findOne({ facultyId: assignedFacultyId });
          if (existingFaculty) {
            assignedFacultyId = await generateFacultyId(); // Regenerate if collision
          }
        }

        const tempPassword = generateTempPassword();
        const systemRole = determineFacultyRole(designation);

        // 1. Create User
        const newUser = new User({
          name,
          email,
          password: tempPassword,
          role: systemRole,
          isActive: true,
          department
        });

        await newUser.save();

        // 2. Try Create Faculty (Compensating Rollback if this fails)
        try {
          const newFaculty = new Faculty({
            user: newUser._id,
            facultyId: assignedFacultyId,
            department,
            designation: designation || 'Faculty',
            phone: phone || ''
          });

          await newFaculty.save();

          successful.push({
            name,
            email,
            facultyId: assignedFacultyId,
            temporaryPassword: tempPassword
          });

        } catch (facultyError) {
          await User.findByIdAndDelete(newUser._id);
          throw new Error(`Failed to create Faculty profile: ${facultyError.message}`);
        }

      } catch (err) {
        failed.push({
          rowNumber: row.rowNumber,
          name,
          email,
          error: err.message
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        successful,
        failed,
        summary: {
          total: rows.length,
          imported: successful.length,
          failed: failed.length
        }
      }
    });

  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({ success: false, message: 'Server error processing bulk import' });
  }
};
