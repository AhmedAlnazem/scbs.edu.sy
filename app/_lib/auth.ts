import "server-only";

import { Role, type User } from "@/generated/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "@/app/_lib/auth-constants";
import {
  createSessionToken,
  hashSessionToken,
  normalizeEmail,
  verifyPassword,
} from "@/app/_lib/auth-crypto";
import { prisma } from "@/app/_lib/prisma";

const SESSION_REFRESH_THRESHOLD_SECONDS = 60 * 60 * 24;

function buildLoginRedirect(nextPath?: string) {
  if (!nextPath) {
    return "/login";
  }

  return `/login?next=${encodeURIComponent(nextPath)}`;
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

async function setSessionCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email: normalizeEmail(email),
    },
  });
}

export async function findUserByUsername(username: string) {
  const normalizedUsername = normalizeUsername(username);

  if (!normalizedUsername) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
  });
}

export async function findUserByIdentifier(identifier: string) {
  const value = identifier.trim();

  if (!value) {
    return null;
  }

  if (value.includes("@")) {
    return findUserByEmail(value);
  }

  return findUserByUsername(value);
}

export async function authenticateUser(identifier: string, password: string) {
  const user = await findUserByIdentifier(identifier);

  if (!user) {
    return null;
  }

  const valid = await verifyPassword(password, user.password);
  return valid ? user : null;
}

export async function createUserSession(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await prisma.session.deleteMany({
    where: {
      userId,
    },
  });

  await prisma.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  await setSessionCookie(token, expiresAt);
}

export async function clearCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(token),
      },
    });
  }

  cookieStore.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(token),
    },
    include: {
      user: true,
    },
  });

  if (!session) {
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });
    cookieStore.delete(SESSION_COOKIE);
    return null;
  }

  const secondsUntilExpiry = Math.floor((session.expiresAt.getTime() - Date.now()) / 1000);

  if (secondsUntilExpiry < SESSION_REFRESH_THRESHOLD_SECONDS) {
    const nextExpiry = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

    await prisma.session.update({
      where: {
        id: session.id,
      },
      data: {
        expiresAt: nextExpiry,
      },
    });

    await setSessionCookie(token, nextExpiry);
  }

  return session.user;
});

export async function requireUser(nextPath?: string) {
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildLoginRedirect(nextPath));
  }

  return user;
}

export async function requirePageRole(allowedRoles: Role[], nextPath?: string) {
  const user = await requireUser(nextPath);

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}

export async function requireRole(allowedRoles: Role[]) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Login required for this action.");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error("You do not have permission for this action.");
  }

  return user;
}

export function withOwnerAccess(roles: Role[]) {
  return roles.includes(Role.OWNER) ? roles : [Role.OWNER, ...roles];
}
