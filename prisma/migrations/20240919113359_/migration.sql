-- AlterTable
ALTER TABLE "Playlist" ALTER COLUMN "types" SET NOT NULL,
ALTER COLUMN "types" SET DEFAULT 'EMPTY',
ALTER COLUMN "types" SET DATA TYPE TEXT;
