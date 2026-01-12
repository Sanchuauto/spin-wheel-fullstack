const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// @desc    Get public campaign details by slug
// @route   GET /api/public/campaign/:slug
// @access  Public
const getPublicCampaign = async (req, res) => {
    const { slug } = req.params;
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { shareableSlug: slug },
            select: {
                id: true,
                name: true,
                brandLogoUrl: true,
                isActive: true,
                startDate: true,
                endDate: true,
                offers: {
                    select: {
                        id: true,
                        offerName: true,
                        offerDescription: true,
                        // Hide weight, limits, codes
                    }
                }
            }
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        // Check validity
        const now = new Date();
        if (!campaign.isActive || now < campaign.startDate || now > campaign.endDate) {
            return res.status(400).json({ message: 'Campaign is not active', campaign: null });
        }

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Execute Spin
// @route   POST /api/public/spin
// @access  Public
const spinWheel = async (req, res) => {
    const { slug, phone } = req.body;

    if (!slug || !phone) {
        return res.status(400).json({ message: 'Slug and phone are required' });
    }

    try {
        // 1. Validate Campaign
        const campaign = await prisma.campaign.findUnique({
            where: { shareableSlug: slug },
            include: { offers: true },
        });

        if (!campaign) {
            return res.status(404).json({ message: 'Campaign not found' });
        }

        const now = new Date();
        if (!campaign.isActive || now < campaign.startDate || now > campaign.endDate) {
            return res.status(400).json({ message: 'Campaign is expired or inactive' });
        }

        // 2. Validate User Limits
        const spinCount = await prisma.spinLog.count({
            where: {
                campaignId: campaign.id,
                phone: phone,
            },
        });

        if (spinCount >= campaign.maxSpinsPerPhone) {
            return res.status(400).json({ message: 'Maximum spins reached for this number' });
        }

        // 3. Select Winning Offer
        let winningOffer = null;

        if (spinCount === 0) {
            // FIRST SPIN: Always give highest-weight offer
            const availableOffers = campaign.offers.filter(
                (offer) =>
                    offer.weight > 0 && offer.redemptionCount < offer.maxRedemptionLimit
            );

            if (availableOffers.length === 0) {
                return res.status(400).json({ message: 'No prizes available at the moment' });
            }

            // Sort by weight descending and pick the first (highest weight)
            availableOffers.sort((a, b) => b.weight - a.weight);
            winningOffer = availableOffers[0];

        } else {
            // SUBSEQUENT SPINS: Weighted random selection with unique-win constraint

            // Get all offers already won by this phone for this campaign
            const previousWins = await prisma.spinLog.findMany({
                where: {
                    campaignId: campaign.id,
                    phone: phone,
                },
                select: {
                    offerId: true,
                },
            });

            const wonOfferIds = new Set(previousWins.map(log => log.offerId));

            // Filter available offers: weight > 0, redemption available, and NOT already won
            const availableOffers = campaign.offers.filter(
                (offer) =>
                    offer.weight > 0 &&
                    offer.redemptionCount < offer.maxRedemptionLimit &&
                    !wonOfferIds.has(offer.id)
            );

            if (availableOffers.length === 0) {
                return res.status(400).json({ message: 'No new prizes available. You have already won all available offers!' });
            }

            // Weighted Random Selection
            let totalWeight = 0;
            availableOffers.forEach((offer) => {
                totalWeight += offer.weight;
            });

            const random = Math.floor(Math.random() * totalWeight);
            let weightSum = 0;

            for (const offer of availableOffers) {
                weightSum += offer.weight;
                if (random < weightSum) {
                    winningOffer = offer;
                    break;
                }
            }

            // Fallback if float math failed (unlikely with integers but safe)
            if (!winningOffer) winningOffer = availableOffers[availableOffers.length - 1];
        }

        // 4. Update Database (Atomic Increment)
        // We use updateMany to ensure we respect the limit atomically
        const updateResult = await prisma.offer.updateMany({
            where: {
                id: winningOffer.id,
                redemptionCount: { lt: winningOffer.maxRedemptionLimit }
            },
            data: {
                redemptionCount: { increment: 1 }
            }
        });

        if (updateResult.count === 0) {
            // Race condition: Offer became unavailable in the split second
            // For simplicity, create a "Better luck next time" log or just error
            // Re-rolling is better but risky for loops. 
            // Let's just return error asking to try again.
            return res.status(409).json({ message: 'Please spin again, prize availability changed.' });
        }

        // 5. Log Spin
        await prisma.spinLog.create({
            data: {
                campaignId: campaign.id,
                phone: phone,
                offerId: winningOffer.id,
                offerNameSnapshot: winningOffer.offerName,
                couponCodeSnapshot: winningOffer.couponCode,
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent') || 'Unknown',
            },
        });

        // 6. Return Result
        res.json({
            offerName: winningOffer.offerName,
            offerDescription: winningOffer.offerDescription,
            couponCode: winningOffer.couponCode,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during spin' });
    }
};

module.exports = { getPublicCampaign, spinWheel };
