const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { v4: uuidv4 } = require("uuid");

// @desc    Create a new campaign
// @route   POST /api/admin/campaigns
// @access  Private (SuperAdmin, Manager)
const createCampaign = async (req, res) => {
    const { name, startDate, endDate, maxSpinsPerPhone, brandLogoUrl } = req.body;

    console.log('Creating campaign with brandLogoUrl:', brandLogoUrl);

    // Generate unique slug
    const slug = name.toLowerCase().replace(/ /g, '-') + '-' + uuidv4().slice(0, 5);

    try {
        const campaign = await prisma.campaign.create({
            data: {
                name,
                brandLogoUrl: brandLogoUrl || null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                maxSpinsPerPhone: parseInt(maxSpinsPerPhone),
                shareableSlug: slug,
                isActive: false // Default to inactive until activated
            },
        });
        res.status(201).json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all campaigns
// @route   GET /api/admin/campaigns
// @access  Private
const getCampaigns = async (req, res) => {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { spinLogs: true }
                }
            }
        });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single campaign
// @route   GET /api/admin/campaigns/:id
// @access  Private
const getCampaignById = async (req, res) => {
    try {
        const campaign = await prisma.campaign.findUnique({
            where: { id: req.params.id },
            include: { offers: true },
        });
        if (campaign) {
            res.json(campaign);
        } else {
            res.status(404).json({ message: 'Campaign not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update campaign
// @route   PUT /api/admin/campaigns/:id
// @access  Private (SuperAdmin, Manager)
const updateCampaign = async (req, res) => {
    const { name, startDate, endDate, maxSpinsPerPhone, brandLogoUrl } = req.body;

    console.log('Updating campaign with brandLogoUrl:', brandLogoUrl);

    try {
        const campaign = await prisma.campaign.update({
            where: { id: req.params.id },
            data: {
                name,
                brandLogoUrl: brandLogoUrl !== undefined ? brandLogoUrl : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                maxSpinsPerPhone: maxSpinsPerPhone ? parseInt(maxSpinsPerPhone) : undefined,
            },
        });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Activate campaign
// @route   PATCH /api/admin/campaigns/:id/activate
// @access  Private (SuperAdmin, Manager)
const activateCampaign = async (req, res) => {
    try {
        const campaign = await prisma.campaign.update({
            where: { id: req.params.id },
            data: { isActive: true },
        });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Deactivate campaign
// @route   PATCH /api/admin/campaigns/:id/deactivate
// @access  Private (SuperAdmin, Manager)
const deactivateCampaign = async (req, res) => {
    try {
        const campaign = await prisma.campaign.update({
            where: { id: req.params.id },
            data: { isActive: false },
        });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    activateCampaign,
    deactivateCampaign
};
