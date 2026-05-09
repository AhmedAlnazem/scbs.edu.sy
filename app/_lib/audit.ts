import "server-only";

import type { Role } from "@/generated/prisma";
import { prisma } from "@/app/_lib/prisma";

type AuditEntryInput = {
  action: string;
  entityType: string;
  entityId?: string | null;
  entityLabel: string;
  details?: string | null;
  actorId?: string | null;
  actorName: string;
  actorRole: Role;
};

export async function createAuditEntry(input: AuditEntryInput) {
  await prisma.auditLog.create({
    data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel,
      details: input.details ?? null,
      actorId: input.actorId ?? null,
      actorName: input.actorName,
      actorRole: input.actorRole,
    },
  });
}

export async function listRecentAuditEntries(limit = 20) {
  return prisma.auditLog.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
}
