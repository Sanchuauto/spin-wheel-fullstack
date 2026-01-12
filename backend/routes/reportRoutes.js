const express = require('express');
const router = express.Router();
const { getSpinLogs, exportSpinLogs, getAnalyticsSummary } = require('../controllers/reportController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/spins', getSpinLogs);
router.get('/spins/export', restrictTo('SUPER_ADMIN', 'ANALYST'), exportSpinLogs); // CampaignManager can view but maybe not export? Prompt says "Export logs" for SuperAdmin and Analyst.
router.get('/analytics/summary', restrictTo('SUPER_ADMIN', 'ANALYST'), getAnalyticsSummary);

module.exports = router;
