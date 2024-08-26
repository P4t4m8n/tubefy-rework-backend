/*
  Warnings:

  - You are about to drop the `LikedSongsPlaylist` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LikedSongsPlaylist" DROP CONSTRAINT "LikedSongsPlaylist_user_id_fkey";

-- DropTable
DROP TABLE "LikedSongsPlaylist";
