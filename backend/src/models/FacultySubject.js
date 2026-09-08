const mongoose = require('mongoose');

const facultySubjectSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Faculty',
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true,
  }
}, { timestamps: true });

// Compound unique index to ensure a faculty member isn't assigned the same subject twice
facultySubjectSchema.index({ faculty: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('FacultySubject', facultySubjectSchema);
