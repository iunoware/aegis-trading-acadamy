/*
  Warnings:

  - You are about to drop the column `purgedAt` on the `DeletionQueue` table. All the data in the column will be lost.
  - Added the required column `action` to the `DeletionQueue` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeletionAction" AS ENUM ('HARD_DELETE', 'ANONYMIZE');

-- CreateEnum
CREATE TYPE "DeletionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RESTORED');

-- DropIndex
DROP INDEX "DeletionQueue_entityId_idx";

-- DropIndex
DROP INDEX "DeletionQueue_entityType_idx";

-- DropIndex
DROP INDEX "DeletionQueue_purgedAt_idx";

-- DropIndex
DROP INDEX "DeletionQueue_restoredAt_idx";

-- AlterTable
ALTER TABLE "DeletionQueue" DROP COLUMN "purgedAt",
ADD COLUMN     "action" "DeletionAction" NOT NULL,
ADD COLUMN     "failedAt" TIMESTAMP(3),
ADD COLUMN     "failureReason" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "status" "DeletionStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "anonymizedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "DeletionQueue_status_idx" ON "DeletionQueue"("status");

-- CreateIndex
CREATE INDEX "DeletionQueue_action_idx" ON "DeletionQueue"("action");

-- CreateIndex
CREATE INDEX "DeletionQueue_status_scheduledPurgeAt_idx" ON "DeletionQueue"("status", "scheduledPurgeAt");

-- CreateIndex
CREATE INDEX "User_anonymizedAt_idx" ON "User"("anonymizedAt");
