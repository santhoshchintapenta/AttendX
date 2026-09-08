require('dotenv').config();
const mongoose = require('mongoose');
const Department = require('../models/Department');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/attendx';

const departmentsToSeed = [
  { name: 'Computer Science and Engineering', code: 'CSE' },
  { name: 'Computer Science and Engineering (AI & ML)', code: 'CSM' },
  { name: 'Computer Science and Engineering (Data Science)', code: 'CSD' },
  { name: 'Information Technology', code: 'IT' },
  { name: 'Electronics and Communication Engineering', code: 'ECE' },
  { name: 'Electrical and Electronics Engineering', code: 'EEE' },
  { name: 'Mechanical Engineering', code: 'MECH' },
  { name: 'Chemical Engineering', code: 'CHEMICAL' },
  { name: 'Civil Engineering', code: 'CIVIL' }
];

const seedDepartments = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected for seeding departments...');

    for (const dept of departmentsToSeed) {
      const existing = await Department.findOne({ code: dept.code });
      if (!existing) {
        await Department.create(dept);
        console.log(`Created department: ${dept.code} - ${dept.name}`);
      } else {
        console.log(`Department ${dept.code} already exists, skipping.`);
      }
    }

    console.log('Department seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding departments:', error);
  } finally {
    mongoose.disconnect();
  }
};

seedDepartments();
