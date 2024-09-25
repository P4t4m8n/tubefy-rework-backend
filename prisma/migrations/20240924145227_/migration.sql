-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "playlistType" TEXT DEFAULT 'OTHER';

-- DropEnum
DROP TYPE "Genre";
