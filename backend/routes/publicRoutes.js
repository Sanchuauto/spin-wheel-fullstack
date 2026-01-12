const express = require('express');
const router = express.Router();
const { getPublicCampaign, spinWheel } = require('../controllers/spinController');
const rateLimit = require('express-rate-limit');

// Specific rate limit for spin to prevent abuse
const spinLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 spins per IP per hour (security layer, not business logic)
    message: 'Too many requests from this IP'
});

router.get('/campaign/:slug', getPublicCampaign);
router.post('/spin', spinLimiter, spinWheel);

module.exports = router;
