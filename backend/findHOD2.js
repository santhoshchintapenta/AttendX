const mongoose = require('mongoose');
const crypto = require('crypto');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/attendx').then(async () => {
  const hod = await User.findOne({ role: 'HOD' });
  if (hod) {
    hod.password = "admin123";
    await hod.save(); // Note: Will hash it via pre-save hook
    console.log("HOD Password forced to admin123");
  }
  process.exit(0);
});
