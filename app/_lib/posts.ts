import "server-only";

import { PostStatus, type PostType, type Role, Prisma } from "@/generated/prisma";

import type { LibraryGradeSlug } from "@/app/_lib/library";
import { joinMediaUrls } from "@/app/_lib/post-media";
import { prisma } from "@/app/_lib/prisma";
import { slugify } from "@/app/_lib/slug";

type SubmissionStatus = "DRAFT" | "PENDING";
type ReviewStatus = "PUBLISHED" | "REJECTED";

export const postIncludes = {
  author: true,
  category: true,
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof postIncludes;
}>;

type CreatePostInput = {
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  imageUrls: string[];
  videoUrls: string[];
  fileUrls: string[];
  classLevel: LibraryGradeSlug;
  type: PostType;
  status: SubmissionStatus;
  authorId: string;
  categoryId: string | null;
  tagNames: string[];
};

type UpdateOwnPostInput = {
  postId: string;
  authorId: string;
  title: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  imageUrls: string[];
  videoUrls: string[];
  fileUrls: string[];
  classLevel: LibraryGradeSlug;
  type: PostType;
  status: SubmissionStatus;
  categoryId: string | null;
  tagNames: string[];
};

async function buildUniqueSlug(baseTitle: string) {
  const baseSlug = slugify(baseTitle) || "post";
  let slug = baseSlug;
  let suffix = 1;

  while (await prisma.post.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }

  return slug;
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function listUsersWithPostCounts() {
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    include: {
      _count: {
        select: {
          posts: true,
        },
      },
    },
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function listTags() {
  return prisma.tag.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function listAllPosts() {
  return prisma.post.findMany({
    include: postIncludes,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function listPublishedPosts() {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
    },
    include: postIncludes,
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function listPublishedPostsByClass(classLevel: LibraryGradeSlug) {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      classLevel,
    },
    include: postIncludes,
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function listPublishedPostsByType(type: PostType) {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      type,
    },
    include: postIncludes,
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function listPublishedPostsByClassAndType(classLevel: LibraryGradeSlug, type?: PostType) {
  return prisma.post.findMany({
    where: {
      status: PostStatus.PUBLISHED,
      classLevel,
      ...(type ? { type } : {}),
    },
    include: postIncludes,
    orderBy: {
      publishedAt: "desc",
    },
  });
}

export async function listPostsByAuthor(authorId: string) {
  return prisma.post.findMany({
    where: {
      authorId,
    },
    include: postIncludes,
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getPublishedPostBySlug(slug: string) {
  return prisma.post.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
    },
    include: postIncludes,
  });
}

export async function getPostById(postId: string) {
  return prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: postIncludes,
  });
}

export async function createPost(input: CreatePostInput) {
  const slug = await buildUniqueSlug(input.title);
  const tagNames = Array.from(new Set(input.tagNames.map((tag) => tag.trim()).filter(Boolean)));

  return prisma.post.create({
    data: {
      title: input.title,
      slug,
      content: input.content,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      imageUrls: joinMediaUrls(input.imageUrls) || null,
      videoUrls: joinMediaUrls(input.videoUrls) || null,
      fileUrls: joinMediaUrls(input.fileUrls) || null,
      classLevel: input.classLevel,
      type: input.type,
      status: input.status,
      authorId: input.authorId,
      categoryId: input.categoryId,
      publishedAt: null,
      tags: tagNames.length
        ? {
            create: await Promise.all(
              tagNames.map(async (tagName) => {
                const tagSlug = slugify(tagName);
                const tag = await prisma.tag.upsert({
                  where: { slug: tagSlug },
                  update: { name: tagName },
                  create: {
                    name: tagName,
                    slug: tagSlug,
                  },
                });

                return {
                  tagId: tag.id,
                };
              }),
            ),
          }
        : undefined,
    },
    include: postIncludes,
  });
}

export async function updateOwnPost(input: UpdateOwnPostInput) {
  const post = await prisma.post.findUnique({
    where: {
      id: input.postId,
    },
    include: {
      tags: true,
    },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  if (post.authorId !== input.authorId) {
    throw new Error("You can only edit your own post.");
  }

  if (post.status === PostStatus.PUBLISHED) {
    throw new Error("Published posts cannot be edited directly by students.");
  }

  const nextTagNames = Array.from(
    new Set(input.tagNames.map((tag) => tag.trim()).filter(Boolean)),
  );

  const currentTagIds = post.tags.map((tag) => ({
    postId_tagId: {
      postId: post.id,
      tagId: tag.tagId,
    },
  }));

  return prisma.post.update({
    where: {
      id: input.postId,
    },
    data: {
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      coverImage: input.coverImage,
      imageUrls: joinMediaUrls(input.imageUrls) || null,
      videoUrls: joinMediaUrls(input.videoUrls) || null,
      fileUrls: joinMediaUrls(input.fileUrls) || null,
      classLevel: input.classLevel,
      type: input.type,
      status: input.status,
      categoryId: input.categoryId,
      publishedAt: null,
      tags: {
        delete: currentTagIds,
        create: await Promise.all(
          nextTagNames.map(async (tagName) => {
            const tagSlug = slugify(tagName);
            const tag = await prisma.tag.upsert({
              where: { slug: tagSlug },
              update: { name: tagName },
              create: {
                name: tagName,
                slug: tagSlug,
              },
            });

            return {
              tagId: tag.id,
            };
          }),
        ),
      },
    },
    include: postIncludes,
  });
}

export async function updatePostStatus(postId: string, status: ReviewStatus) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  if (post.status !== PostStatus.PENDING) {
    throw new Error("Only pending posts can be reviewed.");
  }

  return prisma.post.update({
    where: {
      id: postId,
    },
    data: {
      status,
      publishedAt: status === PostStatus.PUBLISHED ? new Date() : null,
    },
    include: postIncludes,
  });
}

export async function deletePost(postId: string) {
  await prisma.postTag.deleteMany({
    where: {
      postId,
    },
  });

  return prisma.post.delete({
    where: {
      id: postId,
    },
  });
}

export async function deletePostById(postId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
    include: postIncludes,
  });

  if (!post) {
    throw new Error("Post not found.");
  }

  await prisma.postTag.deleteMany({
    where: {
      postId,
    },
  });

  await prisma.post.delete({
    where: {
      id: postId,
    },
  });

  return post;
}

export async function createCategory(name: string) {
  const slug = slugify(name);

  if (!slug) {
    throw new Error("Enter a valid category name.");
  }

  return prisma.category.upsert({
    where: { slug },
    update: { name },
    create: {
      name,
      slug,
    },
  });
}

export async function createTag(name: string) {
  const slug = slugify(name);

  if (!slug) {
    throw new Error("Enter a valid tag name.");
  }

  return prisma.tag.upsert({
    where: { slug },
    update: { name },
    create: {
      name,
      slug,
    },
  });
}

export async function updateUserRole(userId: string, role: Role) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  if (user.isProtected) {
    throw new Error("The protected owner account cannot be changed.");
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    },
  });
}
