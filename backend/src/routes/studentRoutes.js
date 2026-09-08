const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// All student routes require authentication
router.use(authMiddleware);

// POST /api/students - Add a new student (HOD only)
router.post('/', roleMiddleware('HOD'), studentController.addStudent);

// GET /api/students - Get list of students (HOD and Faculty)
router.get('/', roleMiddleware('HOD', 'Faculty'), studentController.getStudents);

// PUT /api/students/:id - Update student (HOD only)
router.put('/:id', roleMiddleware('HOD'), studentController.updateStudent);

// DELETE /api/students/:id - Delete student (HOD only)
router.delete('/:id', roleMiddleware('HOD'), studentController.deleteStudent);

module.exports = router;
