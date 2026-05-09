import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const relativePath = rawUrl.replace(/^file:/, "");
const databasePath = path.resolve(process.cwd(), relativePath);

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

const userColumns = db
  .prepare(`PRAGMA table_info("User")`)
  .all() as Array<{ name: string }>;

if (!userColumns.some((column) => column.name === "username")) {
  db.exec(`ALTER TABLE "User" ADD COLUMN "username" TEXT`);
}

if (!userColumns.some((column) => column.name === "studentClass")) {
  db.exec(`ALTER TABLE "User" ADD COLUMN "studentClass" TEXT`);
}

if (!userColumns.some((column) => column.name === "isProtected")) {
  db.exec(`ALTER TABLE "User" ADD COLUMN "isProtected" BOOLEAN NOT NULL DEFAULT false`);
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
  CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");

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
`);

const postColumns = db
  .prepare(`PRAGMA table_info("Post")`)
  .all() as Array<{ name: string }>;

if (!postColumns.some((column) => column.name === "classLevel")) {
  db.exec(`ALTER TABLE "Post" ADD COLUMN "classLevel" TEXT NOT NULL DEFAULT 'first-secondary'`);
}

if (!postColumns.some((column) => column.name === "imageUrls")) {
  db.exec(`ALTER TABLE "Post" ADD COLUMN "imageUrls" TEXT`);
}

if (!postColumns.some((column) => column.name === "videoUrls")) {
  db.exec(`ALTER TABLE "Post" ADD COLUMN "videoUrls" TEXT`);
}

if (!postColumns.some((column) => column.name === "fileUrls")) {
  db.exec(`ALTER TABLE "Post" ADD COLUMN "fileUrls" TEXT`);
}

db.exec(`
  UPDATE "User"
  SET "username" = lower(substr("email", 1, instr("email", '@') - 1))
  WHERE "username" IS NULL OR trim("username") = '';
`);

db.close();

console.log(`SQLite schema ready: ${databasePath}`);
