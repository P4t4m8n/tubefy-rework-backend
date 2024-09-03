/*
  Warnings:

  - The values [GENEREL_NOTOFICATION] on the enum `NotificationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "NotificationType_new" AS ENUM ('FRIEND_REQUEST', 'FRIEND_ACCEPTED', 'FRIEND_REJECTED', 'FRIEND_BLOCKED', 'FRIEND_REMOVED', 'PLAYLIST_LIKE', 'PLAYLIST_SHARE', 'PLAYLIST_COMMENT', 'SONG_LIKE', 'SONG_COMMENT', 'GENERAL_NOTIFICATION', 'GENERAL_ERROR');
ALTER TABLE "Notification" ALTER COLUMN "type" TYPE "NotificationType_new" USING ("type"::text::"NotificationType_new");
ALTER TYPE "NotificationType" RENAME TO "NotificationType_old";
ALTER TYPE "NotificationType_new" RENAME TO "NotificationType";
DROP TYPE "NotificationType_old";
COMMIT;
