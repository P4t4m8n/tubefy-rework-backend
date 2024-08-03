import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db } from "./index";

async function runMigration() {
  console.log("Running migration...");
  console.log("Database URL: ", process.env.DATABASE_URL);
  await migrate(db, { migrationsFolder: "./migrations" });
  console.log("Migration completed");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Migration failed", err);
  process.exit(1);
});
