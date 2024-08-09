/*
  Warnings:

  - You are about to drop the column `imgUrl` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "imgUrl",
ADD COLUMN     "avatarUrl" TEXT;
