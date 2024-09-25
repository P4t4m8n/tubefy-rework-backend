import { prisma } from "./prismaClient";

export const clearTable = async (tableName: string) => {
  try {
    await prisma.$executeRaw`TRUNCATE TABLE "PlaylistSong" RESTART IDENTITY CASCADE;`;
  } catch (error) {
    console.error("Error while clearing table data:", error);
  } finally {
    await prisma.$disconnect();
  }
};

const tableName = "PlaylistSong";
clearTable(tableName).then(() => {
  console.log(`Table ${tableName} has been cleared.`);
});
