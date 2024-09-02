/*
  Warnings:

  - You are about to drop the column `sender_id` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `from_id` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_sender_id_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "sender_id",
ADD COLUMN     "from_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_from_id_fkey" FOREIGN KEY ("from_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
