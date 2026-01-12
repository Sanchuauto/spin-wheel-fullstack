const express = require('express');
const router = express.Router();
const { updateOffer, deleteOffer } = require('../controllers/offerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/:offerId')
    .put(restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), updateOffer)
    .delete(restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), deleteOffer);

module.exports = router;
