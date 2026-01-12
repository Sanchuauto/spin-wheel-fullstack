-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'CAMPAIGN_MANAGER', 'ANALYST');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "maxSpinsPerPhone" INTEGER NOT NULL,
    "shareableSlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "offerName" TEXT NOT NULL,
    "offerDescription" TEXT,
    "couponCode" TEXT NOT NULL,
    "weight" INTEGER NOT NULL,
    "maxRedemptionLimit" INTEGER NOT NULL,
    "redemptionCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpinLog" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "offerNameSnapshot" TEXT NOT NULL,
    "couponCodeSnapshot" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpinLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "AdminUser"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_shareableSlug_key" ON "Campaign"("shareableSlug");

-- CreateIndex
CREATE INDEX "SpinLog_campaignId_phone_idx" ON "SpinLog"("campaignId", "phone");

-- CreateIndex
CREATE INDEX "SpinLog_createdAt_idx" ON "SpinLog"("createdAt");

-- CreateIndex
CREATE INDEX "SpinLog_phone_idx" ON "SpinLog"("phone");

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpinLog" ADD CONSTRAINT "SpinLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpinLog" ADD CONSTRAINT "SpinLog_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
