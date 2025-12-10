/*
  Warnings:

  - You are about to drop the column `codeExpiresAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailCode` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "codeExpiresAt",
DROP COLUMN "email",
DROP COLUMN "emailCode";
