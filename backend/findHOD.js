const mongoose = require('mongoose');
const User = require('./src/models/User');

mongoose.connect('mongodb://localhost:27017/attendx').then(async () => {
  const hod = await User.findOne({ role: 'HOD' });
  console.log("HOD Email:", hod ? hod.email : "None found");
  process.exit(0);
});
