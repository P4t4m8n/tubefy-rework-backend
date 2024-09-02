-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable
ALTER TABLE "PlaylistShare" ADD COLUMN     "status" "ShareStatus" NOT NULL DEFAULT 'PENDING';
