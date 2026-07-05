const fs = require("fs");
const path = require("path");

const databaseUrl = process.env.DATABASE_URL || "";
const isPostgres =
  databaseUrl.startsWith("postgres:") ||
  databaseUrl.startsWith("postgresql:") ||
  databaseUrl.includes("supabase") ||
  databaseUrl.includes("neon.tech");

const sourceSchema = path.join(__dirname, "../prisma/schema.postgres.prisma");
const targetSchema = path.join(__dirname, "../prisma/schema.prisma");

if (isPostgres) {
  console.log("[DB PREPARE] PostgreSQL connection detected in DATABASE_URL.");
  if (fs.existsSync(sourceSchema)) {
    fs.copyFileSync(sourceSchema, targetSchema);
    console.log("[DB PREPARE] Copied schema.postgres.prisma to schema.prisma successfully.");
  } else {
    console.error("[DB PREPARE] Error: schema.postgres.prisma template not found!");
  }
} else {
  console.log(
    "[DB PREPARE] SQLite or local file URL detected. Keeping default SQLite schema.prisma config."
  );
}
