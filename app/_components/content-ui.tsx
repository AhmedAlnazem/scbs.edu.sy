import Link from "next/link";

import { logoutAction } from "@/app/_actions/auth";
import { PostFormFieldsClient } from "@/app/_components/post-form-fields-client";
import { getLibraryGradeLabel, type LibraryGradeSlug } from "@/app/_lib/library";
import { postStatusLabels, postTypeLabels, roleLabels } from "@/app/_lib/labels";
import type { PostWithRelations } from "@/app/_lib/posts";
import { PostStatus, type PostType, type Role, type User } from "@/generated/prisma";

type Viewer = Pick<User, "name" | "role"> | null;

export function formatDate(value: Date | null) {
  if (!value) {
    return "غير منشور بعد";
  }

  return new Intl.DateTimeFormat("ar-SY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function tagNames(post: PostWithRelations) {
  return post.tags.map((item) => item.tag.name).join("، ");
}

export function roleName(role?: Role | null) {
  return role ? roleLabels[role] : "زائر";
}

export function AppFrame({
  children,
  viewer,
}: {
  children: React.ReactNode;
  currentPath: string;
  viewer: Viewer;
}) {
  const links = [
    { href: "/", label: "الرئيسية" },
    { href: "/posts", label: "المنشورات" },
    { href: "/research", label: "الأبحاث" },
    { href: "/codes", label: "الأكواد" },
    { href: "/library", label: "المكتبة" },
    ...(viewer ? [{ href: "/dashboard", label: "لوحة التحكم" }] : []),
    ...(viewer?.role === "ADMIN" || viewer?.role === "OWNER"
      ? [{ href: "/admin", label: "الإدارة" }]
      : []),
  ];

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="overflow-hidden rounded-[30px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))] p-5 shadow-[var(--shadow)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
              منصه مدرسه الحاسوب للبنين في سرمدا
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
              منصة المحتوى والأبحاث والأكواد
            </h1>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-full border border-[var(--line)] bg-white/70 px-4 py-2 text-sm text-[var(--muted)]">
              {viewer ? (
                <>
                  <span className="font-medium text-[var(--foreground)]">{viewer.name}</span>
                  {" • "}
                  {roleName(viewer.role)}
                </>
              ) : (
                "جلسة زائر"
              )}
            </div>

            {viewer ? (
              <form action={logoutAction}>
                <button
                  className="themeButton rounded-full px-4 py-2 text-sm font-medium"
                  type="submit"
                >
                  تسجيل الخروج
                </button>
              </form>
            ) : (
              <div className="flex gap-3">
                <Link
                  className="themeButton rounded-full px-4 py-2 text-sm font-medium"
                  href="/login"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  className="themeButton rounded-full px-4 py-2 text-sm font-medium"
                  href="/register"
                >
                  إنشاء حساب
                </Link>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              className="themeButton rounded-full px-4 py-2 text-sm transition"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {children}
    </main>
  );
}

export function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent)]">
        {eyebrow}
      </p>
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-7 text-[var(--muted)] sm:text-base">
          {description}
        </p>
      </div>
    </div>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[30px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8 ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6">
      <p className="font-medium text-[var(--foreground)]">{title}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{description}</p>
    </div>
  );
}

export function PostCard({
  post,
  href,
  showStatus = false,
  className = "",
}: {
  post: PostWithRelations;
  href?: string;
  showStatus?: boolean;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
        <span>{postTypeLabels[post.type]}</span>
        <span>•</span>
        <span>{formatDate(post.publishedAt ?? post.updatedAt)}</span>
        {showStatus ? (
          <>
            <span>•</span>
            <span>{postStatusLabels[post.status]}</span>
          </>
        ) : null}
      </div>
      <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">{post.title}</h3>
      {post.excerpt ? (
        <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{post.excerpt}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-[var(--muted)]">
        <span>الكاتب: {post.author.name}</span>
        <span>الصف: {getLibraryGradeLabel(post.classLevel)}</span>
        {post.category ? <span>التصنيف: {post.category.name}</span> : null}
        {post.tags.length > 0 ? <span>الوسوم: {tagNames(post)}</span> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        className={`block rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 transition hover:border-[rgba(163,71,45,0.4)] ${className}`.trim()}
        href={href}
      >
        {content}
      </Link>
    );
  }

  return (
    <article
      className={`block rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 ${className}`.trim()}
    >
      {content}
    </article>
  );
}

export function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-5">
      <p className="text-sm text-[var(--muted)]">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
        {value}
      </p>
    </div>
  );
}

export function DashboardLinks({
  items,
}: {
  basePath: string;
  items: { href: string; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <Link
          key={item.href}
          className="themeButton rounded-full px-4 py-2 text-sm transition"
          href={item.href}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function PostFormFields({
  categories,
  initialValues,
}: {
  categories: { id: string; name: string }[];
  initialValues?: {
    title?: string;
    excerpt?: string | null;
    content?: string;
    coverImage?: string | null;
    imageUrls?: string;
    videoUrls?: string;
    fileUrls?: string;
    classLevel?: LibraryGradeSlug;
    categoryId?: string | null;
    tags?: string;
    type?: PostType;
  };
}) {
  return <PostFormFieldsClient categories={categories} initialValues={initialValues} />;
}

export function isPublished(post: PostWithRelations) {
  return post.status === PostStatus.PUBLISHED;
}
