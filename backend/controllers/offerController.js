const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get offers for a campaign
// @route   GET /api/admin/campaigns/:campaignId/offers
// @access  Private
const getOffers = async (req, res) => {
    try {
        const offers = await prisma.offer.findMany({
            where: { campaignId: req.params.campaignId },
        });
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create offer
// @route   POST /api/admin/campaigns/:campaignId/offers
// @access  Private (SuperAdmin, Manager)
const createOffer = async (req, res) => {
    const { offerName, offerDescription, couponCode, weight, maxRedemptionLimit } = req.body;
    const { campaignId } = req.params;

    try {
        const offer = await prisma.offer.create({
            data: {
                campaignId,
                offerName,
                offerDescription,
                couponCode,
                weight: parseInt(weight),
                maxRedemptionLimit: parseInt(maxRedemptionLimit),
            },
        });
        res.status(201).json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update offer
// @route   PUT /api/admin/offers/:offerId
// @access  Private (SuperAdmin, Manager)
const updateOffer = async (req, res) => {
    const { offerName, offerDescription, couponCode, weight, maxRedemptionLimit } = req.body;

    try {
        const offer = await prisma.offer.update({
            where: { id: req.params.offerId },
            data: {
                offerName,
                offerDescription,
                couponCode,
                weight: weight !== undefined ? parseInt(weight) : undefined,
                maxRedemptionLimit: maxRedemptionLimit !== undefined ? parseInt(maxRedemptionLimit) : undefined,
            },
        });
        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete offer
// @route   DELETE /api/admin/offers/:offerId
// @access  Private (SuperAdmin, Manager)
const deleteOffer = async (req, res) => {
    try {
        await prisma.offer.delete({
            where: { id: req.params.offerId },
        });
        res.json({ message: 'Offer removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOffers,
    createOffer,
    updateOffer,
    deleteOffer
};
