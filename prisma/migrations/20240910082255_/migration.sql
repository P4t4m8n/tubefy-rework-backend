-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "friend_id" TEXT;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_friend_id_fkey" FOREIGN KEY ("friend_id") REFERENCES "Friend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
