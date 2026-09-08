const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const multer = require('multer');
const bulkFacultyController = require('../controllers/bulkFacultyController');

const upload = multer({ storage: multer.memoryStorage() });

// All faculty routes require authentication and HOD role for now
router.use(authMiddleware);
router.use(roleMiddleware('HOD'));

// Bulk Import
router.post('/bulk-import/preview', upload.single('file'), bulkFacultyController.previewUpload);
router.post('/bulk-import/import', bulkFacultyController.importFaculty);

// Basic CRUD
router.post('/', facultyController.addFaculty);
router.get('/', facultyController.getFacultyList);
router.get('/:id', facultyController.getFacultyById);
router.put('/:id', facultyController.updateFaculty);
router.patch('/:id/status', facultyController.updateFacultyStatus);
router.delete('/:id', facultyController.deleteFaculty);

// Subject Capabilities
router.get('/:id/subjects', facultyController.getFacultySubjects);
router.put('/:id/subjects', facultyController.assignFacultySubjects);

module.exports = router;
