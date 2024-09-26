/*
  Warnings:

  - You are about to drop the column `originCountry` on the `Playlist` table. All the data in the column will be lost.
  - You are about to drop the column `playlistType` on the `Song` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "originCountry";

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "playlistType";
