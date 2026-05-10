import "dotenv/config";
import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";

type ColumnRow = { name: string };

const tursoUrl =
  process.env.TURSO_DATABASE_URL ?? process.env["scbsedu_TURSO_DATABASE_URL"];
const tursoAuthToken =
  process.env.TURSO_AUTH_TOKEN ?? process.env["scbsedu_TURSO_AUTH_TOKEN"];
const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";

const sharedSchemaSql = `
  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

  CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User" ("id")
      ON DELETE CASCADE
      ON UPDATE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Session_tokenHash_key" ON "Session"("tokenHash");

  CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "entityLabel" TEXT NOT NULL,
    "details" TEXT,
    "actorId" TEXT,
    "actorName" TEXT NOT NULL,
    "actorRole" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_actorId_fkey"
      FOREIGN KEY ("actorId") REFERENCES "User" ("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
  );

  CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

  CREATE TABLE IF NOT EXISTS "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Tag_slug_key" ON "Tag"("slug");

  CREATE TABLE IF NOT EXISTS "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "imageUrls" TEXT,
    "videoUrls" TEXT,
    "fileUrls" TEXT,
    "classLevel" TEXT NOT NULL DEFAULT 'first-secondary',
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" DATETIME,
    CONSTRAINT "Post_authorId_fkey"
      FOREIGN KEY ("authorId") REFERENCES "User" ("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
    CONSTRAINT "Post_categoryId_fkey"
      FOREIGN KEY ("categoryId") REFERENCES "Category" ("id")
      ON DELETE SET NULL
      ON UPDATE CASCADE
  );

  CREATE UNIQUE INDEX IF NOT EXISTS "Post_slug_key" ON "Post"("slug");

  CREATE TABLE IF NOT EXISTS "PostTag" (
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("postId", "tagId"),
    CONSTRAINT "PostTag_postId_fkey"
      FOREIGN KEY ("postId") REFERENCES "Post" ("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE,
    CONSTRAINT "PostTag_tagId_fkey"
      FOREIGN KEY ("tagId") REFERENCES "Tag" ("id")
      ON DELETE RESTRICT
      ON UPDATE CASCADE
  );
`;

const userColumnsToEnsure = [
  {
    name: "username",
    sql: `ALTER TABLE "User" ADD COLUMN "username" TEXT`,
  },
  {
    name: "studentClass",
    sql: `ALTER TABLE "User" ADD COLUMN "studentClass" TEXT`,
  },
  {
    name: "isProtected",
    sql: `ALTER TABLE "User" ADD COLUMN "isProtected" BOOLEAN NOT NULL DEFAULT false`,
  },
] as const;

const postColumnsToEnsure = [
  {
    name: "classLevel",
    sql: `ALTER TABLE "Post" ADD COLUMN "classLevel" TEXT NOT NULL DEFAULT 'first-secondary'`,
  },
  {
    name: "imageUrls",
    sql: `ALTER TABLE "Post" ADD COLUMN "imageUrls" TEXT`,
  },
  {
    name: "videoUrls",
    sql: `ALTER TABLE "Post" ADD COLUMN "videoUrls" TEXT`,
  },
  {
    name: "fileUrls",
    sql: `ALTER TABLE "Post" ADD COLUMN "fileUrls" TEXT`,
  },
] as const;

function splitStatements(sql: string) {
  return sql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

async function setupTurso() {
  const client = createClient({
    url: tursoUrl!,
    authToken: tursoAuthToken,
  });

  for (const statement of splitStatements(sharedSchemaSql)) {
    await client.execute(statement);
  }

  const userColumns = (
    await client.execute(`PRAGMA table_info("User")`)
  ).rows as unknown as ColumnRow[];

  for (const column of userColumnsToEnsure) {
    if (!userColumns.some((entry) => entry.name === column.name)) {
      await client.execute(column.sql);
    }
  }

  await client.execute(`CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username")`);

  const postColumns = (
    await client.execute(`PRAGMA table_info("Post")`)
  ).rows as unknown as ColumnRow[];

  for (const column of postColumnsToEnsure) {
    if (!postColumns.some((entry) => entry.name === column.name)) {
      await client.execute(column.sql);
    }
  }

  await client.execute(`
    UPDATE "User"
    SET "username" = lower(substr("email", 1, instr("email", '@') - 1))
    WHERE "username" IS NULL OR trim("username") = ''
  `);

  client.close();
  console.log(`Turso schema ready: ${tursoUrl}`);
}

function setupSqlite() {
  const relativePath = rawUrl.replace(/^file:/, "");
  const databasePath = path.resolve(process.cwd(), relativePath);

  fs.mkdirSync(path.dirname(databasePath), { recursive: true });

  const db = new Database(databasePath);
  db.pragma("foreign_keys = ON");
  db.exec(sharedSchemaSql);

  const userColumns = db.prepare(`PRAGMA table_info("User")`).all() as ColumnRow[];

  for (const column of userColumnsToEnsure) {
    if (!userColumns.some((entry) => entry.name === column.name)) {
      db.exec(column.sql);
    }
  }

  db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username")`);

  const postColumns = db.prepare(`PRAGMA table_info("Post")`).all() as ColumnRow[];

  for (const column of postColumnsToEnsure) {
    if (!postColumns.some((entry) => entry.name === column.name)) {
      db.exec(column.sql);
    }
  }

  db.exec(`
    UPDATE "User"
    SET "username" = lower(substr("email", 1, instr("email", '@') - 1))
    WHERE "username" IS NULL OR trim("username") = ''
  `);

  db.close();
  console.log(`SQLite schema ready: ${databasePath}`);
}

async function main() {
  if (tursoUrl) {
    await setupTurso();
    return;
  }

  setupSqlite();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
