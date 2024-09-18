/*
  Warnings:

  - Changed the type of `startIp` on the `LocationIP` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `endIp` on the `LocationIP` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "LocationIP" DROP COLUMN "startIp",
ADD COLUMN     "startIp" INET NOT NULL,
DROP COLUMN "endIp",
ADD COLUMN     "endIp" INET NOT NULL;
