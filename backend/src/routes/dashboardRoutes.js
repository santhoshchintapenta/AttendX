const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Only HODs should fetch HOD stats
router.get('/hod-stats', roleMiddleware('HOD'), dashboardController.getHODStats);

module.exports = router;
