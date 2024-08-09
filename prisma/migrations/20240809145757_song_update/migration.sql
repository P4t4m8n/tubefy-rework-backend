/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Song` table. All the data in the column will be lost.
  - Added the required column `imgUrl` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Song" DROP COLUMN "thumbnail",
ADD COLUMN     "imgUrl" TEXT NOT NULL;
