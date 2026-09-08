const express = require('express');
const router = express.Router();
const multer = require('multer');
const bulkUploadController = require('../controllers/bulkUploadController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Use memory storage for fast processing without saving to disk
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

// Only HODs can bulk upload students
router.post('/preview', roleMiddleware('HOD'), upload.single('file'), bulkUploadController.previewUpload);
router.post('/import', roleMiddleware('HOD'), bulkUploadController.importStudents);

module.exports = router;
