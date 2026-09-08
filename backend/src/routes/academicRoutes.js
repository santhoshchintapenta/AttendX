const express = require('express');
const academicController = require('../controllers/academicController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Departments (Read-only for all authenticated users)
router.get('/departments', authMiddleware, academicController.getDepartments);

// Sections (Protected by HOD role)
router.get('/sections', authMiddleware, roleMiddleware('HOD'), academicController.getSections);
router.post('/sections', authMiddleware, roleMiddleware('HOD'), academicController.createSection);
router.put('/sections/:id', authMiddleware, roleMiddleware('HOD'), academicController.updateSection);
router.delete('/sections/:id', authMiddleware, roleMiddleware('HOD'), academicController.deleteSection);

// Subjects (Protected by HOD role)
router.get('/subjects', authMiddleware, roleMiddleware('HOD'), academicController.getSubjects);
router.post('/subjects', authMiddleware, roleMiddleware('HOD'), academicController.createSubject);
router.put('/subjects/:id', authMiddleware, roleMiddleware('HOD'), academicController.updateSubject);
router.delete('/subjects/:id', authMiddleware, roleMiddleware('HOD'), academicController.deleteSubject);

module.exports = router;
