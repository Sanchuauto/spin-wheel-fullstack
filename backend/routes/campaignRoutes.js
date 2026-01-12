const express = require('express');
const router = express.Router();
const {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    activateCampaign,
    deactivateCampaign
} = require('../controllers/campaignController');
const { getOffers, createOffer } = require('../controllers/offerController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getCampaigns)
    .post(restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), createCampaign);

router.route('/:id')
    .get(getCampaignById)
    .put(restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), updateCampaign);

router.patch('/:id/activate', restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), activateCampaign);
router.patch('/:id/deactivate', restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), deactivateCampaign);

// Nested routes for offers
router.route('/:campaignId/offers')
    .get(getOffers)
    .post(restrictTo('SUPER_ADMIN', 'CAMPAIGN_MANAGER'), createOffer);

module.exports = router;
