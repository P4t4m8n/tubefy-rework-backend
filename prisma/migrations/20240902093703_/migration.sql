-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('SONG', 'PLAYLIST');

-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN     "itemType" "ItemType" NOT NULL DEFAULT 'PLAYLIST';

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "itemType" "ItemType" NOT NULL DEFAULT 'SONG';
