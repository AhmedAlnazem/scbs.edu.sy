import "dotenv/config";

import { randomBytes } from "node:crypto";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { PrismaClient } from "../generated/prisma";
import { hashPassword, normalizeEmail } from "../app/_lib/auth-crypto";

function normalizeIdentifier(identifier: string) {
  const value = identifier.trim();
  return value.includes("@") ? normalizeEmail(value) : value.toLowerCase();
}

function createTemporaryPassword() {
  return randomBytes(12).toString("base64url");
}

async function main() {
  const tursoUrl =
    process.env.TURSO_DATABASE_URL ?? process.env["scbsedu_TURSO_DATABASE_URL"];
  const tursoAuthToken =
    process.env.TURSO_AUTH_TOKEN ?? process.env["scbsedu_TURSO_AUTH_TOKEN"];
  const databaseUrl = process.env.DATABASE_URL;

  if (!tursoUrl && !databaseUrl) {
    throw new Error("TURSO_DATABASE_URL or DATABASE_URL is not set.");
  }

  const rawIdentifier = process.argv[2];
  const nextPassword = process.argv[3] ?? createTemporaryPassword();

  if (!rawIdentifier) {
    throw new Error("Usage: npm run auth:reset-password -- <username-or-email> [new-password]");
  }

  const identifier = normalizeIdentifier(rawIdentifier);
  const prisma = new PrismaClient({
    adapter: tursoUrl
      ? new PrismaLibSql({
          url: tursoUrl,
          authToken: tursoAuthToken,
        })
      : new PrismaBetterSqlite3({
          url: databaseUrl!,
        }),
  });

  try {
    const user = await prisma.user.findFirst({
      where: identifier.includes("@") ? { email: identifier } : { username: identifier },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    if (!user) {
      throw new Error(`User not found for "${rawIdentifier}".`);
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await hashPassword(nextPassword),
      },
    });

    await prisma.session.deleteMany({
      where: {
        userId: user.id,
      },
    });

    console.log(
      JSON.stringify(
        {
          username: user.username,
          email: user.email,
          password: nextPassword,
          sessionsCleared: true,
        },
        null,
        2,
      ),
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
