const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
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
  sectionName: {
    type: String,
    required: true,
  }
}, { timestamps: true });

// Compound unique index
sectionSchema.index({ department: 1, year: 1, semester: 1, sectionName: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema);
