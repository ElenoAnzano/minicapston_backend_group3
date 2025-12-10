/*
  Warnings:

  - You are about to drop the column `conversationId` on the `ChatMessage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "ChatMessage_conversationId_idx";

-- AlterTable
ALTER TABLE "ChatMessage" DROP COLUMN "conversationId";
