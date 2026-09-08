const User = require('../models/User');
const Faculty = require('../models/Faculty');
const FacultySubject = require('../models/FacultySubject');
const Subject = require('../models/Subject');
const crypto = require('crypto');

// Utility to generate a random temporary password
exports.generateTempPassword = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

exports.determineFacultyRole = (designation) => {
  if (!designation) return 'Faculty';
  const norm = String(designation).trim().toLowerCase();
  if (norm === 'hod' || norm === 'head of department') {
    return 'HOD';
  }
  return 'Faculty';
};

exports.generateFacultyId = async () => {
  const year = new Date().getFullYear();
  const prefix = `FAC-${year}-`;
  
  const lastFaculty = await Faculty.findOne({ facultyId: { $regex: `^${prefix}` } })
    .sort({ facultyId: -1 })
    .collation({ locale: "en_US", numericOrdering: true });
    
  let sequence = 1;
  if (lastFaculty && lastFaculty.facultyId) {
    const parts = lastFaculty.facultyId.split('-');
    const lastSequence = parseInt(parts[2], 10);
    if (!isNaN(lastSequence)) {
      sequence = lastSequence + 1;
    }
  }
  
  return `${prefix}${String(sequence).padStart(3, '0')}`;
};

exports.addFaculty = async (req, res) => {
  try {
    let { name, email, phone, facultyId, designation } = req.body;
    const department = req.user.department; // HOD's department

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    if (!facultyId) {
      facultyId = await exports.generateFacultyId();
    }

    // Check if user email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Check if facultyId already exists
    const existingFaculty = await Faculty.findOne({ facultyId });
    if (existingFaculty) {
      return res.status(400).json({ success: false, message: 'Faculty ID already in use' });
    }

    const tempPassword = exports.generateTempPassword();
    const systemRole = exports.determineFacultyRole(designation);

    // 1. Create User
    const newUser = new User({
      name,
      email,
      password: tempPassword,
      role: systemRole,
      isActive: true,
      department // Storing it in User for legacy/global queries if needed
    });

    await newUser.save();

    // 2. Try Create Faculty (Compensating Rollback if this fails)
    try {
      const newFaculty = new Faculty({
        user: newUser._id,
        facultyId,
        department,
        designation,
        phone
      });

      const savedFaculty = await newFaculty.save();

      return res.status(201).json({
        success: true,
        message: 'Faculty created successfully',
        data: {
          _id: savedFaculty._id,
          facultyId: savedFaculty.facultyId,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        temporaryPassword: tempPassword // Return ONLY once
      });

    } catch (facultyError) {
      // Safe compensating rollback
      await User.findByIdAndDelete(newUser._id);
      console.error('Failed to create faculty profile, rolled back user creation:', facultyError);
      return res.status(500).json({ success: false, message: 'Failed to create Faculty profile. User creation rolled back.' });
    }

  } catch (error) {
    console.error('Error adding faculty:', error);
    res.status(500).json({ success: false, message: 'Server error adding faculty' });
  }
};

exports.getFacultyList = async (req, res) => {
  try {
    const department = req.user.department;

    // Fetch faculty for the HOD's department and populate User details safely
    const facultyList = await Faculty.find({ department })
      .populate('user', 'name email role isActive')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: facultyList });
  } catch (error) {
    console.error('Error fetching faculty list:', error);
    res.status(500).json({ success: false, message: 'Server error fetching faculty' });
  }
};

exports.getFacultyById = async (req, res) => {
  try {
    const department = req.user.department;

    const faculty = await Faculty.findOne({ _id: req.params.id, department })
      .populate('user', 'name email role isActive');

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    res.status(200).json({ success: true, data: faculty });
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching faculty details' });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const department = req.user.department;
    const { name, email, phone, facultyId, designation } = req.body;

    const faculty = await Faculty.findOne({ _id: req.params.id, department }).populate('user');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Check unique constraints if changing email or facultyId
    if (email && email !== faculty.user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ success: false, message: 'Email already in use' });
    }
    
    if (facultyId && facultyId !== faculty.facultyId) {
      const idExists = await Faculty.findOne({ facultyId });
      if (idExists) return res.status(400).json({ success: false, message: 'Faculty ID already in use' });
    }

    // Update User
    if (name) faculty.user.name = name;
    if (email) faculty.user.email = email;
    await faculty.user.save();

    // Update Faculty
    if (facultyId) faculty.facultyId = facultyId;
    if (designation !== undefined && designation !== faculty.designation) {
      faculty.designation = designation;
      // If designation changes, automatically recalculate role, provided they aren't a Student
      if (faculty.user.role === 'Faculty' || faculty.user.role === 'HOD') {
        faculty.user.role = exports.determineFacultyRole(designation);
        await faculty.user.save(); // save the newly updated role
      }
    }
    if (phone !== undefined) faculty.phone = phone;
    await faculty.save();

    const updatedFaculty = await Faculty.findById(faculty._id).populate('user', 'name email role isActive');

    res.status(200).json({ success: true, message: 'Faculty updated successfully', data: updatedFaculty });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ success: false, message: 'Server error updating faculty' });
  }
};

exports.updateFacultyStatus = async (req, res) => {
  try {
    const department = req.user.department;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({ success: false, message: 'isActive status is required' });
    }

    const faculty = await Faculty.findOne({ _id: req.params.id, department }).populate('user');
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Status is stored in User
    faculty.user.isActive = isActive;
    await faculty.user.save();

    res.status(200).json({ success: true, message: `Faculty marked as ${isActive ? 'active' : 'inactive'}` });
  } catch (error) {
    console.error('Error updating faculty status:', error);
    res.status(500).json({ success: false, message: 'Server error updating faculty status' });
  }
};

// =========================================================
// SUBJECT CAPABILITY APIs
// =========================================================

exports.getFacultySubjects = async (req, res) => {
  try {
    const department = req.user.department;

    const faculty = await Faculty.findOne({ _id: req.params.id, department });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    const facultySubjects = await FacultySubject.find({ faculty: faculty._id })
      .populate('subject');

    res.status(200).json({ success: true, data: facultySubjects });
  } catch (error) {
    console.error('Error fetching faculty subjects:', error);
    res.status(500).json({ success: false, message: 'Server error fetching subjects' });
  }
};

exports.assignFacultySubjects = async (req, res) => {
  try {
    const department = req.user.department;
    const { subjectIds } = req.body; // Array of subject ObjectIds

    if (!Array.isArray(subjectIds)) {
      return res.status(400).json({ success: false, message: 'subjectIds must be an array' });
    }

    const faculty = await Faculty.findOne({ _id: req.params.id, department });
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Verify all subjects belong to the HOD's department
    if (subjectIds.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjectIds }, department });
      if (validSubjects.length !== subjectIds.length) {
        return res.status(400).json({ success: false, message: 'One or more subjects are invalid or do not belong to this department' });
      }
    }

    // Overwrite existing assignments: remove old ones, create new ones
    await FacultySubject.deleteMany({ faculty: faculty._id });

    const newAssignments = subjectIds.map(subId => ({
      faculty: faculty._id,
      subject: subId
    }));

    if (newAssignments.length > 0) {
      await FacultySubject.insertMany(newAssignments);
    }

    res.status(200).json({ success: true, message: 'Subjects assigned successfully' });
  } catch (error) {
    console.error('Error assigning faculty subjects:', error);
    res.status(500).json({ success: false, message: 'Server error assigning subjects' });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const department = req.user.department;
    const faculty = await Faculty.findOne({ _id: req.params.id, department });
    
    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found' });
    }

    // Delete FacultySubject mappings
    await FacultySubject.deleteMany({ faculty: faculty._id });
    
    // Delete User
    if (faculty.user) {
      await User.findByIdAndDelete(faculty.user);
    }
    
    // Delete Faculty profile
    await Faculty.findByIdAndDelete(faculty._id);

    res.status(200).json({ success: true, message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ success: false, message: 'Server error deleting faculty' });
  }
};
