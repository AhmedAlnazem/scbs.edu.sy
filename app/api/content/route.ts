import { NextResponse } from "next/server";

import { PostStatus, PostType, Role } from "@/generated/prisma";
import { listAllPosts } from "@/app/_lib/posts";
import { getCurrentUser } from "@/app/_lib/session";

function hasReviewerAccess(role: Role | undefined) {
  return role === Role.TEACHER || role === Role.ADMIN || role === Role.OWNER;
}

function parsePostType(value: string | null) {
  const normalized = value?.toUpperCase() as PostType | undefined;
  return normalized && normalized in PostType ? normalized : null;
}

function parsePostStatus(value: string | null) {
  const normalized = value?.toUpperCase() as PostStatus | undefined;
  return normalized && normalized in PostStatus ? normalized : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedType = parsePostType(searchParams.get("type"));
  const requestedStatus = parsePostStatus(searchParams.get("status"));
  const scope = searchParams.get("scope");

  const currentUser = await getCurrentUser();
  const canViewAll = scope === "all" && hasReviewerAccess(currentUser?.role);
  const items = await listAllPosts();

  const filtered = items.filter((item) => {
    if (!canViewAll && item.status !== PostStatus.PUBLISHED) {
      return false;
    }

    if (requestedType && item.type !== requestedType) {
      return false;
    }

    if (requestedStatus && item.status !== requestedStatus) {
      return false;
    }

    return true;
  });

  return NextResponse.json({
    scope: canViewAll ? "all" : "published",
    total: filtered.length,
    items: filtered,
  });
}
