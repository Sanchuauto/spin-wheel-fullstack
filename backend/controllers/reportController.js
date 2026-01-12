const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { Parser } = require('json2csv');

// @desc    Get spin logs with filtering
// @route   GET /api/admin/spins
// @access  Private
const getSpinLogs = async (req, res) => {
    const { campaignId, phone, from, to, page = 1, limit = 20 } = req.query;

    const where = {};
    if (campaignId) where.campaignId = campaignId;
    if (phone) where.phone = { contains: phone };
    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
    }

    try {
        const logs = await prisma.spinLog.findMany({
            where,
            skip: (parseInt(page) - 1) * parseInt(limit),
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: { campaign: { select: { name: true } } }
        });

        const count = await prisma.spinLog.count({ where });

        res.json({ logs, total: count, pages: Math.ceil(count / limit) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Export spin logs to CSV
// @route   GET /api/admin/spins/export
// @access  Private
const exportSpinLogs = async (req, res) => {
    const { campaignId, phone, from, to } = req.query;

    const where = {};
    if (campaignId) where.campaignId = campaignId;
    if (phone) where.phone = { contains: phone };
    if (from || to) {
        where.createdAt = {};
        if (from) where.createdAt.gte = new Date(from);
        if (to) where.createdAt.lte = new Date(to);
    }

    try {
        const logs = await prisma.spinLog.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { campaign: { select: { name: true } } }
        });

        const fields = [
            { label: 'Campaign', value: 'campaign.name' },
            { label: 'Phone', value: 'phone' },
            { label: 'Offer', value: 'offerNameSnapshot' },
            { label: 'Coupon', value: 'couponCodeSnapshot' },
            { label: 'Date', value: (row) => row.createdAt.toISOString() },
            { label: 'IP', value: 'ipAddress' }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(logs);

        res.header('Content-Type', 'text/csv');
        res.attachment('spin_logs.csv');
        res.send(csv);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get analytics summary
// @route   GET /api/admin/analytics/summary
// @access  Private
const getAnalyticsSummary = async (req, res) => {
    try {
        const totalSpins = await prisma.spinLog.count();

        const now = new Date();
        const activeCampaigns = await prisma.campaign.count({
            where: {
                isActive: true,
                startDate: { lte: now },
                endDate: { gte: now }
            }
        });

        // Count distinct phone numbers (total users)
        const totalUsers = await prisma.spinLog.findMany({
            select: { phone: true },
            distinct: ['phone']
        });

        // Get spins per day for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const spinsPerDayRaw = await prisma.$queryRaw`
            SELECT DATE("createdAt") as date, COUNT(*)::int as count 
            FROM "SpinLog" 
            WHERE "createdAt" >= ${sevenDaysAgo}
            GROUP BY DATE("createdAt") 
            ORDER BY date ASC
        `;

        // Format dates to YYYY-MM-DD strings
        const spinsPerDay = spinsPerDayRaw.map(row => ({
            date: row.date.toISOString().split('T')[0],
            count: row.count
        }));

        res.json({
            totalSpins: totalSpins || 0,
            activeCampaigns: activeCampaigns || 0,
            totalUsers: totalUsers.length || 0,
            spinsPerDay: spinsPerDay || []
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSpinLogs, exportSpinLogs, getAnalyticsSummary };
