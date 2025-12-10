/*
  Warnings:

  - Added the required column `receiverId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "receiverId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ChatMessage_receiverId_idx" ON "ChatMessage"("receiverId");
