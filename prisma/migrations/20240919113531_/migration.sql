/*
  Warnings:

  - You are about to drop the column `types` on the `Playlist` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Playlist" DROP COLUMN "types",
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'EMPTY';
