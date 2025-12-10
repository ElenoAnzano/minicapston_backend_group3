/*
  Warnings:

  - You are about to drop the column `eventList` on the `DashboardHandler` table. All the data in the column will be lost.
  - Added the required column `items` to the `DashboardHandler` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DashboardHandler" DROP COLUMN "eventList",
ADD COLUMN     "items" TEXT NOT NULL;
