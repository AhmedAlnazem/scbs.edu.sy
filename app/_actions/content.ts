"use server";

import { revalidatePath } from "next/cache";

import { PostStatus, PostType, Role } from "@/generated/prisma";
import { createAuditEntry } from "@/app/_lib/audit";
import { hashPassword, normalizeEmail } from "@/app/_lib/auth-crypto";
import { isLibraryGrade, libraryGrades, type LibraryGradeSlug } from "@/app/_lib/library";
import { splitMediaUrls } from "@/app/_lib/post-media";
import { prisma } from "@/app/_lib/prisma";
import {
  createCategory,
  createPost,
  createTag,
  deletePostById,
  updateOwnPost,
  updatePostStatus,
  updateUserRole,
} from "@/app/_lib/posts";
import { findUserByEmail, findUserByUsername, requireRole, withOwnerAccess } from "@/app/_lib/session";

type SubmissionStatus = "DRAFT" | "PENDING";
type ReviewStatus = "PUBLISHED" | "REJECTED";
const studentClassOptions = ["الأول الثانوي", "الثاني ثانوي", "الثالث الثانوي"] as const;

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function normalizeUsernameCandidate(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, "");
}

async function buildUniqueUsername(name: string, email: string) {
  const emailBase = normalizeUsernameCandidate(email.split("@")[0] ?? "");
  const nameBase = normalizeUsernameCandidate(name.replace(/\s+/g, ""));
  const base = emailBase || nameBase || "user";
  let candidate = base;
  let suffix = 1;

  while (await findUserByUsername(candidate)) {
    suffix += 1;
    candidate = `${base}${suffix}`;
  }

  return candidate;
}

function validateName(name: string) {
  if (name.length < 2) {
    throw new Error("Name must be at least 2 characters.");
  }
}

function validateEmail(email: string) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))) {
    throw new Error("Enter a valid email address.");
  }
}

function validatePassword(password: string) {
  if (password.length < 7) {
    throw new Error("Password must be at least 7 characters.");
  }
}

function validateUserRole(value: string) {
  const role = value.toUpperCase() as Role;

  if (!(role in Role) || role === Role.OWNER) {
    throw new Error("Invalid role.");
  }

  return role;
}

function validateStudentClassForRole(studentClass: string, role: Role) {
  if (role !== Role.STUDENT) {
    return null;
  }

  if (!studentClassOptions.includes(studentClass as (typeof studentClassOptions)[number])) {
    throw new Error("Select a valid class for student accounts.");
  }

  return studentClass;
}

function validatePostType(value: string): PostType {
  const postType = value.toUpperCase() as PostType;

  if (!(postType in PostType)) {
    throw new Error("Invalid content type.");
  }

  return postType;
}

function validateClassLevel(value: string): LibraryGradeSlug {
  if (!isLibraryGrade(value)) {
    throw new Error("Invalid class level.");
  }

  return value;
}

function validateSubmissionMode(value: string): SubmissionStatus {
  if (value === PostStatus.DRAFT) {
    return PostStatus.DRAFT;
  }

  if (value === PostStatus.PENDING) {
    return PostStatus.PENDING;
  }

  throw new Error("Invalid submission mode.");
}

function validateContentInput(title: string, excerpt: string, content: string) {
  if (title.length < 6) {
    throw new Error("Title must be at least 6 characters.");
  }

  if (excerpt.length > 0 && excerpt.length < 12) {
    throw new Error("Excerpt must be at least 12 characters.");
  }

  if (content.length < 40) {
    throw new Error("Content must be at least 40 characters.");
  }
}

function revalidateContentPaths(postId?: string) {
  revalidatePath("/");
  revalidatePath("/posts");
  revalidatePath("/research");
  revalidatePath("/codes");
  revalidatePath("/library");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/posts");
  revalidatePath("/admin");
  revalidatePath("/admin/posts");

  if (postId) {
    revalidatePath(`/dashboard/posts/${postId}/edit`);
  }

  for (const grade of libraryGrades) {
    revalidatePath(`/library/${grade.slug}`);
    revalidatePath(`/library/${grade.slug}/posts`);
    revalidatePath(`/library/${grade.slug}/codes`);
    revalidatePath(`/library/${grade.slug}/research`);
    revalidatePath(`/library/${grade.slug}/projects`);
  }
}

export async function createContentAction(formData: FormData) {
  const user = await requireRole(withOwnerAccess([Role.STUDENT]));

  const title = readText(formData, "title");
  const excerpt = readText(formData, "excerpt");
  const content = readText(formData, "content");
  const coverImage = readText(formData, "coverImage");
  const imageUrls = splitMediaUrls(readText(formData, "imageUrls"));
  const videoUrls = splitMediaUrls(readText(formData, "videoUrls"));
  const fileUrls = splitMediaUrls(readText(formData, "fileUrls"));
  const classLevel = validateClassLevel(readText(formData, "classLevel"));
  const categoryId = readText(formData, "categoryId");
  const tags = readText(formData, "tags");
  const type = validatePostType(readText(formData, "type"));
  const status = validateSubmissionMode(readText(formData, "submitMode"));

  validateContentInput(title, excerpt, content);

  const post = await createPost({
    title,
    excerpt: excerpt || null,
    content,
    coverImage: coverImage || null,
    imageUrls,
    videoUrls,
    fileUrls,
    classLevel,
    type,
    status,
    authorId: user.id,
    categoryId: categoryId || null,
    tagNames: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });

  await createAuditEntry({
    action: "CREATE_POST",
    entityType: "POST",
    entityId: post.id,
    entityLabel: post.title,
    details: `${post.type} / ${post.status} / ${post.classLevel}`,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidateContentPaths(post.id);
}

export async function updateContentAction(postId: string, formData: FormData) {
  const user = await requireRole(withOwnerAccess([Role.STUDENT]));

  const title = readText(formData, "title");
  const excerpt = readText(formData, "excerpt");
  const content = readText(formData, "content");
  const coverImage = readText(formData, "coverImage");
  const imageUrls = splitMediaUrls(readText(formData, "imageUrls"));
  const videoUrls = splitMediaUrls(readText(formData, "videoUrls"));
  const fileUrls = splitMediaUrls(readText(formData, "fileUrls"));
  const classLevel = validateClassLevel(readText(formData, "classLevel"));
  const categoryId = readText(formData, "categoryId");
  const tags = readText(formData, "tags");
  const type = validatePostType(readText(formData, "type"));
  const status = validateSubmissionMode(readText(formData, "submitMode"));

  validateContentInput(title, excerpt, content);

  const post = await updateOwnPost({
    postId,
    authorId: user.id,
    title,
    excerpt: excerpt || null,
    content,
    coverImage: coverImage || null,
    imageUrls,
    videoUrls,
    fileUrls,
    classLevel,
    type,
    status,
    categoryId: categoryId || null,
    tagNames: tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
  });

  await createAuditEntry({
    action: "UPDATE_POST",
    entityType: "POST",
    entityId: post.id,
    entityLabel: post.title,
    details: `${post.type} / ${post.status} / ${post.classLevel}`,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidateContentPaths(postId);
}

export async function reviewContentAction(postId: string, nextStatus: ReviewStatus) {
  const user = await requireRole(withOwnerAccess([Role.TEACHER, Role.ADMIN]));
  const post = await updatePostStatus(postId, nextStatus);

  await createAuditEntry({
    action: nextStatus === PostStatus.PUBLISHED ? "PUBLISH_POST" : "REJECT_POST",
    entityType: "POST",
    entityId: post.id,
    entityLabel: post.title,
    details: `${post.type} / ${post.status} / ${post.classLevel}`,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidateContentPaths(postId);
}

export async function createCategoryAction(formData: FormData) {
  const user = await requireRole(withOwnerAccess([Role.ADMIN]));
  const category = await createCategory(readText(formData, "name"));

  await createAuditEntry({
    action: "CREATE_CATEGORY",
    entityType: "CATEGORY",
    entityId: category.id,
    entityLabel: category.name,
    details: category.slug,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/categories");
}

export async function createTagAction(formData: FormData) {
  const user = await requireRole(withOwnerAccess([Role.ADMIN]));
  const tag = await createTag(readText(formData, "name"));

  await createAuditEntry({
    action: "CREATE_TAG",
    entityType: "TAG",
    entityId: tag.id,
    entityLabel: tag.name,
    details: tag.slug,
    actorId: user.id,
    actorName: user.name,
    actorRole: user.role,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/tags");
}

export async function updateUserRoleAction(formData: FormData) {
  const actor = await requireRole(withOwnerAccess([Role.ADMIN]));

  const userId = readText(formData, "userId");
  const roleValue = readText(formData, "role").toUpperCase() as Role;

  if (!(roleValue in Role)) {
    throw new Error("Invalid role.");
  }

  const updatedUser = await updateUserRole(userId, roleValue);

  await createAuditEntry({
    action: "UPDATE_USER_ROLE",
    entityType: "USER",
    entityId: updatedUser.id,
    entityLabel: updatedUser.name,
    details: `${updatedUser.username} -> ${updatedUser.role}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function createAdminUserAction(formData: FormData) {
  const actor = await requireRole(withOwnerAccess([Role.ADMIN]));

  const name = readText(formData, "name");
  const email = readText(formData, "email");
  const password = readText(formData, "password");
  const role = validateUserRole(readText(formData, "role"));
  const studentClass = validateStudentClassForRole(readText(formData, "studentClass"), role);

  validateName(name);
  validateEmail(email);
  validatePassword(password);

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error("This email address is already registered.");
  }

  const username = await buildUniqueUsername(name, normalizedEmail);

  const user = await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      username,
      password: await hashPassword(password),
      role,
      studentClass,
    },
  });

  await createAuditEntry({
    action: "CREATE_USER",
    entityType: "USER",
    entityId: user.id,
    entityLabel: user.name,
    details: `${user.username} / ${user.role}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export async function deleteContentAdminAction(postId: string) {
  const actor = await requireRole(withOwnerAccess([Role.ADMIN]));
  const post = await deletePostById(postId);

  await createAuditEntry({
    action: "DELETE_POST",
    entityType: "POST",
    entityId: post.id,
    entityLabel: post.title,
    details: `${post.type} / ${post.status} / ${post.classLevel} / author:${post.author.name}`,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
  });

  revalidateContentPaths(postId);
}
