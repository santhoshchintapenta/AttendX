require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const User = require('../models/User');
const Department = require('../models/Department');

const seedAdmin = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/attendx';
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('Please provide ADMIN_EMAIL and ADMIN_PASSWORD in .env');
      process.exit(1);
    }

    const csmDept = await mongoose.model('Department').findOne({ code: 'CSM' });
    if (!csmDept) {
      console.error('CSM Department not found. Please run seedDepartments.js first.');
      return;
    }

    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('Admin user already exists. Updating department mapping if missing...');
      if (!existingAdmin.department || existingAdmin.department.toString() !== csmDept._id.toString()) {
        existingAdmin.department = csmDept._id;
        await existingAdmin.save();
        console.log('Admin department mapped to CSM successfully.');
      } else {
        console.log('Admin already mapped to CSM.');
      }
      process.exit(0);
    }

    const adminUser = new User({
      name: 'Department Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'HOD',
      isActive: true,
      department: csmDept._id
    });

    await adminUser.save();
    console.log('Successfully created initial HOD account.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to seed HOD account:', error);
    process.exit(1);
  }
};

seedAdmin();
