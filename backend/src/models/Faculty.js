const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  facultyId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Faculty', facultySchema);
