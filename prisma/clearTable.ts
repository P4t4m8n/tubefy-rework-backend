import { prisma } from "./prismaClient";

async function clearTable() {
  try {
    // Clear data from the table before migration
    await prisma.$executeRaw`TRUNCATE TABLE "LocationIP" RESTART IDENTITY CASCADE;`;

    

    console.log("All data from LocationIP table has been removed.");
  } catch (error) {
    console.error("Error while clearing table data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

clearTable();
