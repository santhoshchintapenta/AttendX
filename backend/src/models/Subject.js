const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  year: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4],
  },
  semester: {
    type: Number,
    required: true,
    enum: [1, 2],
  },
  subjectName: {
    type: String,
    required: true,
  },
  subjectCode: {
    type: String,
    required: true,
    unique: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
