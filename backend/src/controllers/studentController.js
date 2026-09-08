const User = require('../models/User');
const Student = require('../models/Student');
const Section = require('../models/Section');
const crypto = require('crypto');

exports.addStudent = async (req, res) => {
  try {
    const { fullName, rollNumber, email, phoneNumber, year, semester, section } = req.body;

    // The HOD's department
    const department = req.user.department;

    if (!fullName || !rollNumber || !year || !semester || !section) {
      return res.status(400).json({ success: false, message: 'Required fields must be provided' });
    }

    // Verify section belongs to HOD's department
    const sectionDoc = await Section.findById(section);
    if (!sectionDoc || sectionDoc.department.toString() !== department.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid section for this department' });
    }

    // Handle optional email safely based on existing User schema
    let finalEmail = email ? email.trim().toLowerCase() : `${rollNumber.trim().toLowerCase()}@student.attendx.local`;

    // Validate email format if explicitly provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }

    // Check if email exists in User or Student
    const existingUserEmail = await User.findOne({ email: finalEmail });
    const existingStudentEmail = await Student.findOne({ email: finalEmail });
    if (existingUserEmail || existingStudentEmail) {
      return res.status(400).json({ success: false, message: email ? 'Email is already registered' : 'Generated email from roll number conflicts' });
    }

    // Check if rollNumber exists
    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'Roll number already exists' });
    }

    // Generate secure temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');

    // Create User account
    const user = new User({
      email: finalEmail,
      password: tempPassword,
      role: 'Student',
      name: fullName,
      department,
      isActive: true,
    });
    await user.save();

    // Create Student profile
    const student = new Student({
      user: user._id,
      fullName,
      rollNumber,
      email: finalEmail,
      phoneNumber: phoneNumber || '',
      department,
      year: parseInt(year),
      semester: parseInt(semester),
      section,
    });
    await student.save();

    // In a real app, send an email with the temporary password here

    res.status(201).json({
      success: true,
      message: 'Student added successfully',
      data: student,
    });
  } catch (error) {
    console.error('Error adding student:', error);
    res.status(500).json({ success: false, message: 'Server error adding student' });
  }
};

exports.getStudents = async (req, res) => {
  try {
    const { year, semester, section, search } = req.query;
    
    // Base filter: only students in the requester's department
    // (Assuming this endpoint is for HOD or Faculty of that department)
    // For now we enforce department restriction from req.user
    const filter = {};
    if (req.user.department) {
      filter.department = req.user.department;
    }

    if (year) filter.year = parseInt(year);
    if (semester) filter.semester = parseInt(semester);
    if (section) filter.section = section;
    
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { rollNumber: searchRegex },
        { email: searchRegex }
      ];
    }

    const students = await Student.find(filter)
      .populate('section', 'sectionName')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Server error fetching students' });
  }
};

exports.updateStudent = async (req, res) => {
  const mongoose = require('mongoose');
  let session;
  
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const studentId = req.params.id;
    const { fullName, email, phoneNumber, year, semester, section } = req.body;
    const department = req.user.department;

    // Verify student exists and belongs to department
    const student = await Student.findById(studentId).session(session);
    if (!student || student.department.toString() !== department.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    // Verify new section belongs to department
    const sectionDoc = await Section.findById(section).session(session);
    if (!sectionDoc || sectionDoc.department.toString() !== department.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Invalid section for this department' });
    }

    // Handle optional email
    let finalEmail = email ? email.trim().toLowerCase() : `${student.rollNumber.trim().toLowerCase()}@student.attendx.local`;

    // Validate email format if explicitly provided
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(finalEmail)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
    }

    // Check if email changed and uniqueness
    if (finalEmail !== student.email) {
      const existingUserEmail = await User.findOne({ email: finalEmail }).session(session);
      const existingStudentEmail = await Student.findOne({ email: finalEmail }).session(session);
      if (existingUserEmail || existingStudentEmail) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: email ? 'Email is already registered' : 'Generated email conflicts' });
      }
    }

    // Update Student
    student.fullName = fullName;
    student.email = finalEmail;
    student.phoneNumber = phoneNumber || '';
    student.year = parseInt(year);
    student.semester = parseInt(semester);
    student.section = section;
    await student.save({ session });

    // Update Linked User
    const user = await User.findById(student.user).session(session);
    if (user) {
      user.name = fullName;
      user.email = finalEmail;
      await user.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: student,
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        console.error('Error aborting transaction:', e.message);
      }
    }
    
    // Fallback if transactions are not supported (e.g. standalone MongoDB)
    if (error.message && error.message.toLowerCase().includes('transaction')) {
      console.warn('Transactions not supported. Falling back to sequential update.');
      try {
        const studentId = req.params.id;
        const { fullName, email, phoneNumber, year, semester, section } = req.body;
        const department = req.user.department;
        
        const student = await Student.findById(studentId);
        if (!student || student.department.toString() !== department.toString()) {
          return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
        }

        let finalEmail = email ? email.trim().toLowerCase() : `${student.rollNumber.trim().toLowerCase()}@student.attendx.local`;
        
        if (email) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(finalEmail)) {
            return res.status(400).json({ success: false, message: 'Invalid email format' });
          }
        }
        
        if (finalEmail !== student.email) {
          const existingUserEmail = await User.findOne({ email: finalEmail });
          if (existingUserEmail) {
            return res.status(400).json({ success: false, message: email ? 'Email is already registered' : 'Generated email conflicts' });
          }
        }
        
        student.fullName = fullName;
        student.email = finalEmail;
        student.phoneNumber = phoneNumber || '';
        student.year = parseInt(year);
        student.semester = parseInt(semester);
        student.section = section;
        await student.save();
        
        const user = await User.findById(student.user);
        if (user) {
          user.name = fullName;
          user.email = finalEmail;
          await user.save();
        }
        
        return res.status(200).json({
          success: true,
          message: 'Student updated successfully (fallback)',
          data: student,
        });
      } catch (fallbackError) {
        console.error('Error updating student (fallback):', fallbackError);
        return res.status(500).json({ success: false, message: 'Server error updating student' });
      }
    }

    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Server error updating student' });
  }
};

exports.deleteStudent = async (req, res) => {
  const mongoose = require('mongoose');
  let session;
  
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const studentId = req.params.id;
    const department = req.user.department;

    const student = await Student.findById(studentId).session(session);
    if (!student || student.department.toString() !== department.toString()) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
    }

    // Delete associated User account
    if (student.user) {
      await User.findByIdAndDelete(student.user).session(session);
    }
    
    // Delete Student profile
    await Student.findByIdAndDelete(studentId).session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: 'Student and linked account deleted successfully',
    });
  } catch (error) {
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch (e) {
        console.error('Error aborting transaction:', e.message);
      }
    }
    
    // Fallback if transactions are not supported
    if (error.message && error.message.toLowerCase().includes('transaction')) {
      console.warn('Transactions not supported. Falling back to sequential delete.');
      try {
        const studentId = req.params.id;
        const department = req.user.department;
        
        const student = await Student.findById(studentId);
        
        if (!student || student.department.toString() !== department.toString()) {
          return res.status(404).json({ success: false, message: 'Student not found or unauthorized' });
        }
        
        if (student.user) {
          await User.findByIdAndDelete(student.user);
        }
        await Student.findByIdAndDelete(studentId);
        
        return res.status(200).json({
          success: true,
          message: 'Student and linked account deleted successfully (fallback)',
        });
      } catch (fallbackError) {
        console.error('Error deleting student (fallback):', fallbackError);
        return res.status(500).json({ success: false, message: 'Server error deleting student' });
      }
    }

    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Server error deleting student' });
  }
};
