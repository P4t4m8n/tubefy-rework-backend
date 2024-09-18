/*
  Warnings:

  - You are about to drop the column `continentCode` on the `LocationIP` table. All the data in the column will be lost.
  - You are about to drop the column `continentName` on the `LocationIP` table. All the data in the column will be lost.
  - Added the required column `countryCode` to the `LocationIP` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryName` to the `LocationIP` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "LocationIP" DROP COLUMN "continentCode",
DROP COLUMN "continentName",
ADD COLUMN     "countryCode" VARCHAR(100) NOT NULL,
ADD COLUMN     "countryName" VARCHAR(2) NOT NULL;
