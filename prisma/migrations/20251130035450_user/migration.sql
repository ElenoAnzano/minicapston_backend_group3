-- AlterTable
ALTER TABLE "User" ADD COLUMN     "codeExpiresAt" TIMESTAMP(3),
ADD COLUMN     "email" TEXT,
ADD COLUMN     "emailCode" TEXT;
