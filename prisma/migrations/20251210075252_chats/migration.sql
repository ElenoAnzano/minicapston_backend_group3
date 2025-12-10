/*
  Warnings:

  - Added the required column `conversationId` to the `ChatMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "conversationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");
