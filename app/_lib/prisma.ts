import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/generated/prisma";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const tursoUrl =
  process.env.TURSO_DATABASE_URL ?? process.env["scbsedu_TURSO_DATABASE_URL"];
const tursoAuthToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env["scbsedu_TURSO_AUTH_TOKEN"];
const databaseUrl = process.env.DATABASE_URL;

if (!tursoUrl && !databaseUrl) {
  throw new Error("TURSO_DATABASE_URL veya DATABASE_URL tanımlı değil.");
}

const adapter = tursoUrl
  ? new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoAuthToken,
    })
  : new PrismaBetterSqlite3({
      url: databaseUrl!,
    });

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

function hasExpectedDelegates(client: PrismaClient) {
  return "auditLog" in client && "post" in client && "user" in client;
}

const cachedPrisma =
  globalForPrisma.prisma && hasExpectedDelegates(globalForPrisma.prisma)
    ? globalForPrisma.prisma
    : undefined;

export const prisma = cachedPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
