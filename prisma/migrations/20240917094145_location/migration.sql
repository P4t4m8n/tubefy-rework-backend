-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PlaylistType" ADD VALUE 'LOCAL_MUSIC';
ALTER TYPE "PlaylistType" ADD VALUE 'OTHER';
ALTER TYPE "PlaylistType" ADD VALUE 'POPLER';
ALTER TYPE "PlaylistType" ADD VALUE 'CHARTS';
ALTER TYPE "PlaylistType" ADD VALUE 'DECADE';

-- CreateTable
CREATE TABLE "LocationIP" (
    "id" TEXT NOT NULL,
    "startIp" BIGINT NOT NULL,
    "endIp" BIGINT NOT NULL,
    "continentCode" VARCHAR(2) NOT NULL,
    "continentName" VARCHAR(100) NOT NULL,

    CONSTRAINT "LocationIP_pkey" PRIMARY KEY ("id")
);
