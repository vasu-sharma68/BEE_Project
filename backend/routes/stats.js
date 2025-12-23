const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { personalStats, folderInsights } = require('../controllers/statsController');

// GET /api/stats/personal
router.get('/personal', auth, personalStats);

// GET /api/stats/folders
router.get('/folders', auth, folderInsights);

module.exports = router;