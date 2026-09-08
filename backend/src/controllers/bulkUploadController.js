const xlsx = require('xlsx');
const crypto = require('crypto');
const User = require('../models/User');
const Student = require('../models/Student');
const Section = require('../models/Section');

const workbookAnalyzer = require('../services/import/workbookAnalyzer');
const tableDetector = require('../services/import/tableDetector');
const studentNormalizer = require('../services/import/studentNormalizer');
const validationService = require('../services/import/validationService');

exports.previewUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Support manual overrides if inference was wrong
    let overrides = null;
    if (req.body.overrideYear || req.body.overrideSemester || req.body.overrideSection) {
      overrides = {
        year: req.body.overrideYear,
        semester: req.body.overrideSemester,
        section: req.body.overrideSection
      };
    }

    // 1. Extract raw matrices
    const matrices = workbookAnalyzer.extractMatrices(req.file.buffer);
    if (matrices.length === 0) {
      return res.status(400).json({ success: false, message: 'Unable to detect a valid student data structure.' });
    }

    // 2. Detect tables
    const tables = tableDetector.findTables(matrices);
    if (tables.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Unable to detect a valid student data structure. Please ensure the sheet contains at least Roll Number and Name.' 
      });
    }

    // 3. Normalize students and infer metadata
    const { students: rawStudents, detectedMetadata } = studentNormalizer.normalize(tables, matrices, overrides);

    // 4. Validate business logic
    const { valid, duplicates, invalid, newSectionsCount } = await validationService.validate(rawStudents, req.user.department);

    res.status(200).json({
      success: true,
      data: {
        total: rawStudents.length,
        detectedMetadata,
        valid,
        duplicates,
        invalid,
        newSectionsCount
      }
    });

  } catch (error) {
    console.error('Error in universal preview upload:', error);
    res.status(500).json({ success: false, message: 'Server error analyzing file structure' });
  }
};

exports.importStudents = async (req, res) => {
  const mongoose = require('mongoose');
  
  try {
    const { students } = req.body;
    if (!students || !Array.isArray(students)) {
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }

    const department = req.user.department;
    let importedCount = 0;
    const errors = [];
    const sectionCache = new Map();

    // Process sequentially to ensure predictable synchronization
    for (const record of students) {
      let session = null;
      try {
        session = await mongoose.startSession();
        session.startTransaction();

        let currentSectionId = record.sectionId;

        // 1. Resolve or Create Section
        if (record.isNewSection) {
          const cacheKey = `${record.year}_${record.semester}_${record.sectionName.toUpperCase()}`;
          if (sectionCache.has(cacheKey)) {
            currentSectionId = sectionCache.get(cacheKey);
          } else {
            // Check DB inside transaction
            let existingSection = await Section.findOne({
              department, year: record.year, semester: record.semester, sectionName: record.sectionName.toUpperCase()
            }).session(session);

            if (existingSection) {
              currentSectionId = existingSection._id;
              sectionCache.set(cacheKey, currentSectionId);
            } else {
              try {
                const newSection = new Section({
                  department,
                  year: record.year,
                  semester: record.semester,
                  sectionName: record.sectionName.toUpperCase()
                });
                await newSection.save({ session });
                currentSectionId = newSection._id;
                sectionCache.set(cacheKey, currentSectionId);
              } catch (secErr) {
                if (secErr.code === 11000) {
                  // Concurrent duplicate creation, fetch the newly created section
                  existingSection = await Section.findOne({
                    department, year: record.year, semester: record.semester, sectionName: record.sectionName.toUpperCase()
                  }).session(session);
                  currentSectionId = existingSection._id;
                  sectionCache.set(cacheKey, currentSectionId);
                } else {
                  throw secErr;
                }
              }
            }
          }
        }

        // 2. Re-validate section belongs to authenticated HOD's department
        const sectionDoc = await Section.findById(currentSectionId).session(session);
        if (!sectionDoc || sectionDoc.department.toString() !== department.toString()) {
          throw new Error('Invalid section or unauthorized department access');
        }

        // 3. Re-check duplicates against database (in case added by others)
        const existingRoll = await Student.findOne({ rollNumber: record.rollNumber }).session(session);
        if (existingRoll) throw new Error('Roll Number already exists');

        const existingUserEmail = await User.findOne({ email: record.finalEmail }).session(session);
        const existingStudentEmail = await Student.findOne({ email: record.finalEmail }).session(session);
        if (existingUserEmail || existingStudentEmail) {
          throw new Error('Email already exists');
        }

        // 4. Generate secure temporary password
        const tempPassword = crypto.randomBytes(8).toString('hex');

        // 5. Create User
        const user = new User({
          email: record.finalEmail,
          password: tempPassword,
          role: 'Student',
          name: record.fullName,
          department,
          isActive: true,
        });
        await user.save({ session });

        // 6. Create Student Profile
        const student = new Student({
          user: user._id,
          fullName: record.fullName,
          rollNumber: record.rollNumber,
          email: record.finalEmail,
          phoneNumber: record.phoneNumber || '',
          department,
          year: record.year,
          semester: record.semester,
          section: currentSectionId,
        });
        await student.save({ session });

        await session.commitTransaction();
        session.endSession();
        importedCount++;

      } catch (rowError) {
        if (session) {
          try {
            await session.abortTransaction();
            session.endSession();
          } catch (e) {}
        }
        
        // Fallback for standalone MongoDB (doesn't support transactions)
        if (rowError.message && rowError.message.toLowerCase().includes('transaction')) {
          try {
            let currentSectionId = record.sectionId;

            if (record.isNewSection) {
              const cacheKey = `${record.year}_${record.semester}_${record.sectionName.toUpperCase()}`;
              if (sectionCache.has(cacheKey)) {
                currentSectionId = sectionCache.get(cacheKey);
              } else {
                let existingSection = await Section.findOne({
                  department, year: record.year, semester: record.semester, sectionName: record.sectionName.toUpperCase()
                });

                if (existingSection) {
                  currentSectionId = existingSection._id;
                  sectionCache.set(cacheKey, currentSectionId);
                } else {
                  try {
                    const newSection = new Section({
                      department, year: record.year, semester: record.semester, sectionName: record.sectionName.toUpperCase()
                    });
                    await newSection.save();
                    currentSectionId = newSection._id;
                    sectionCache.set(cacheKey, currentSectionId);
                  } catch (secErr) {
                    if (secErr.code === 11000) {
                      existingSection = await Section.findOne({
                        department, year: record.year, semester: record.semester, sectionName: record.sectionName.toUpperCase()
                      });
                      currentSectionId = existingSection._id;
                      sectionCache.set(cacheKey, currentSectionId);
                    } else {
                      throw secErr;
                    }
                  }
                }
              }
            }

            const sectionDoc = await Section.findById(currentSectionId);
            if (!sectionDoc || sectionDoc.department.toString() !== department.toString()) throw new Error('Invalid section');
            
            const existingRoll = await Student.findOne({ rollNumber: record.rollNumber });
            if (existingRoll) throw new Error('Roll Number already exists');

            const existingUserEmail = await User.findOne({ email: record.finalEmail });
            if (existingUserEmail) throw new Error('Email already exists');

            const tempPassword = crypto.randomBytes(8).toString('hex');

            const user = new User({
              email: record.finalEmail,
              password: tempPassword,
              role: 'Student',
              name: record.fullName,
              department,
              isActive: true,
            });
            await user.save();

            const student = new Student({
              user: user._id,
              fullName: record.fullName,
              rollNumber: record.rollNumber,
              email: record.finalEmail,
              phoneNumber: record.phoneNumber || '',
              department,
              year: record.year,
              semester: record.semester,
              section: currentSectionId,
            });
            await student.save();

            importedCount++;
          } catch (fallbackError) {
            errors.push({ rowNumber: record.rowNumber, rollNumber: record.rollNumber, reason: fallbackError.message });
          }
        } else {
          errors.push({ rowNumber: record.rowNumber, rollNumber: record.rollNumber, reason: rowError.message });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        importedCount,
        errors
      }
    });

  } catch (error) {
    console.error('Error importing students:', error);
    res.status(500).json({ success: false, message: 'Server error importing students' });
  }
};
