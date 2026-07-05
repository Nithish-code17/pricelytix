import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const isSqlite =
  connectionString.startsWith("file:") ||
  connectionString.startsWith("sqlite:") ||
  (!connectionString.startsWith("postgres:") && !connectionString.startsWith("postgresql:"));

let prismaInstance: PrismaClient;

if (isSqlite) {
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
  const adapter = new PrismaBetterSqlite3({
    url: connectionString,
  });
  prismaInstance = new PrismaClient({
    adapter,
  });
} else {
  prismaInstance = new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}