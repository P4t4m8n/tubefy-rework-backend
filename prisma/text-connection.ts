import pkg from "pg";
const { Client } = pkg;
import dotenv from "dotenv";

dotenv.config();

async function testConnection() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.info("Connected to the database successfully.");
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    await client.end();
  }
}

testConnection();
