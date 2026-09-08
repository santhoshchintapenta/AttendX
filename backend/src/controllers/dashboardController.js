const Student = require('../models/Student');

exports.getHODStats = async (req, res) => {
  try {
    const departmentId = req.user.department;
    
    // The required fix: Count students using real MongoDB data and the department filter.
    const totalStudents = await Student.countDocuments({ department: departmentId });
    
    // Return other stats as placeholders to match the existing UI until those modules are built.
    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        totalFaculty: 0,
        todayClasses: 0,
        overallAttendance: '--'
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Server error fetching dashboard stats' });
  }
};
