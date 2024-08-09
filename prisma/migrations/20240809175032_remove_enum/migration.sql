/*
  Warnings:

  - The `genres` column on the `Playlist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `types` column on the `Playlist` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `genres` column on the `Song` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "genres",
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY['OTHER']::TEXT[],
DROP COLUMN "types",
ADD COLUMN     "types" TEXT[] DEFAULT ARRAY['EMPTY']::TEXT[];

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "genres",
ADD COLUMN     "genres" TEXT[] DEFAULT ARRAY['OTHER']::TEXT[];
