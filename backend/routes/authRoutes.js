const express = require('express');
const router = express.Router();
const { loginAdmin, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.get('/health', (req, res) => res.json({ status: 'ok', message: 'Auth routes active' }));
router.post('/login', loginAdmin);
router.get('/me', protect, getMe);

module.exports = router;
