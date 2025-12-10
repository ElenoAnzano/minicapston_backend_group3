/*
  Warnings:

  - You are about to drop the column `eventlist` on the `DashboardHandler` table. All the data in the column will be lost.
  - Added the required column `eventList` to the `DashboardHandler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DashboardHandler" DROP COLUMN "eventlist",
ADD COLUMN     "eventList" TEXT NOT NULL;
