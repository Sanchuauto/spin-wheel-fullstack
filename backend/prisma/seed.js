const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Admins
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const managerPassword = await bcrypt.hash('Manager@123', salt);
  const analystPassword = await bcrypt.hash('Analyst@123', salt);

  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  });

  await prisma.adminUser.upsert({
    where: { username: 'manager' },
    update: {},
    create: {
      username: 'manager',
      password: managerPassword,
      role: 'CAMPAIGN_MANAGER',
    },
  });

  await prisma.adminUser.upsert({
    where: { username: 'analyst' },
    update: {},
    create: {
      username: 'analyst',
      password: analystPassword,
      role: 'ANALYST',
    },
  });

  console.log('Admins seeded.');

  // 2. Create Campaign
  // Date logic
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  const campaign = await prisma.campaign.upsert({
    where: { shareableSlug: 'salon-fest-9Ax3W' }, // Using a fixed slug for idempotency or check uniqueness
    update: {},
    create: {
      name: 'Salon Festival',
      brandLogoUrl: 'https://via.placeholder.com/120x120/667eea/ffffff?text=Salon+Fest',
      isActive: true,
      startDate: yesterday,
      endDate: thirtyDaysLater,
      maxSpinsPerPhone: 2,
      shareableSlug: 'salon-fest-9Ax3W',
    },
  });

  console.log('Campaign seeded:', campaign.name);

  // 3. Create Offers
  // We need to delete existing offers for this campaign to ensure clean state if re-running, or just upsert hard to do without IDs. 
  // We'll just create if not exists count check.
  const offerCount = await prisma.offer.count({ where: { campaignId: campaign.id } });

  if (offerCount === 0) {
    await prisma.offer.createMany({
      data: [
        {
          campaignId: campaign.id,
          offerName: 'Free Bath',
          offerDescription: 'Get a complimentary bath for your pet.',
          couponCode: 'BATH100',
          weight: 9,
          maxRedemptionLimit: 100,
        },
        {
          campaignId: campaign.id,
          offerName: 'Free Haircut',
          offerDescription: 'Stylish haircut free of charge.',
          couponCode: 'CUT50',
          weight: 7,
          maxRedemptionLimit: 50,
        },
        {
          campaignId: campaign.id,
          offerName: 'Free Consultation',
          offerDescription: 'Consult with our experts.',
          couponCode: 'CONSULTFREE',
          weight: 0,
          maxRedemptionLimit: 999,
        },
      ],
    });
    console.log('Offers seeded.');
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
