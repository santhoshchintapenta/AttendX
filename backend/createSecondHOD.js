const mongoose = require('mongoose');
const User = require('./src/models/User');
const Department = require('./src/models/Department');

mongoose.connect('mongodb://localhost:27017/attendx').then(async () => {
  try {
    const email = 'selvanideepthi.csm@anits.edu.in';
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists, updating to HOD...');
      existing.role = 'HOD';
      existing.password = 'admin123';
      await existing.save();
      console.log('User updated to HOD.');
    } else {
      // Find CSM department
      const dept = await Department.findOne({ code: 'CSM' });
      if (!dept) {
        console.log('CSM Department not found!');
        process.exit(1);
      }
      const newHod = new User({
        name: 'Selvani Deepthi',
        email,
        password: 'admin123',
        role: 'HOD',
        department: dept._id,
        isActive: true
      });
      await newHod.save();
      console.log('Second HOD created successfully. Password is: admin123');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
