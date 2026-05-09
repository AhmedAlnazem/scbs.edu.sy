import Link from "next/link";

import { PostStatus, Role } from "@/generated/prisma";
import { deleteContentAdminAction, reviewContentAction } from "@/app/_actions/content";
import { EmptyState, PageIntro, Surface, formatDate } from "@/app/_components/content-ui";
import { SubmitButton } from "@/app/_components/submit-button";
import { getLibraryGradeLabel } from "@/app/_lib/library";
import { postStatusLabels, postTypeLabels } from "@/app/_lib/labels";
import { listAllPosts } from "@/app/_lib/posts";
import { requirePageRole, withOwnerAccess } from "@/app/_lib/session";

function statusChip(status: PostStatus) {
  if (status === PostStatus.PUBLISHED) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === PostStatus.PENDING) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (status === PostStatus.REJECTED) {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

export default async function AdminPostsPage() {
  await requirePageRole(withOwnerAccess([Role.ADMIN]), "/admin/posts");
  const posts = await listAllPosts();

  const publishedCount = posts.filter((post) => post.status === PostStatus.PUBLISHED).length;
  const pendingCount = posts.filter((post) => post.status === PostStatus.PENDING).length;
  const rejectedCount = posts.filter((post) => post.status === PostStatus.REJECTED).length;
  const draftCount = posts.filter((post) => post.status === PostStatus.DRAFT).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-[rgba(0,38,35,0.14)] bg-[linear-gradient(135deg,#103d38_0%,#0b322d_58%,#0a2925_100%)] p-6 shadow-[0_24px_70px_rgba(0,38,35,0.16)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(163,71,45,0.16),transparent_22%)]" />

        <div className="relative grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5 text-white">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                إدارة المنشورات
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                مراجعة كل المواد من شاشة واحدة
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
                هنا تمر كل المنشورات عبر قرارات النشر والرفض والحذف، مع وضوح سريع للحالة والنوع
                والصف وصاحب المادة.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">الإجمالي</p>
                <p className="mt-2 text-3xl font-semibold">{posts.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">قيد المراجعة</p>
                <p className="mt-2 text-3xl font-semibold">{pendingCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">منشور</p>
                <p className="mt-2 text-3xl font-semibold">{publishedCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">مسودات ومرفوض</p>
                <p className="mt-2 text-3xl font-semibold">{draftCount + rejectedCount}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 self-start">
            <div className="rounded-[28px] border border-[rgba(0,38,35,0.08)] bg-[rgba(255,250,242,0.96)] p-5 text-[var(--foreground)] shadow-[0_18px_36px_rgba(0,38,35,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                أولوية العمل
              </p>
              <p className="mt-3 text-lg font-semibold">
                ابدأ بالمواد المعلقة أولًا ثم عالج المرفوض لإعادة تدويره داخل النظام.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-amber-700">
                  {pendingCount} ينتظر قرارًا
                </span>
                <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-rose-700">
                  {rejectedCount} يحتاج تعديلًا
                </span>
              </div>
            </div>

            <Link
              className="themeButton rounded-[24px] px-5 py-4 text-center text-sm font-medium"
              href="/posts"
            >
              عرض الواجهة العامة للمنشورات
            </Link>
          </div>
        </div>
      </section>

      <Surface className="bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageIntro
            eyebrow="Content Queue"
            title="صف المراجعة الكامل"
            description="كل بطاقة تعطيك قرارًا مباشرًا: افتح المادة، انشرها، ارفضها، أو احذفها نهائيًا."
          />
          <div className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--muted)]">
            ترتيب حسب آخر تعديل
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {posts.length === 0 ? (
            <EmptyState title="لا توجد منشورات" description="عند إضافة محتوى سيظهر هنا فورًا." />
          ) : (
            posts.map((post) => (
              <article
                key={post.id}
                className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_14px_32px_rgba(0,38,35,0.05)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[rgba(163,71,45,0.18)] bg-[rgba(163,71,45,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                        {postTypeLabels[post.type]}
                      </span>
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusChip(post.status)}`}
                      >
                        {postStatusLabels[post.status]}
                      </span>
                      <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                        {getLibraryGradeLabel(post.classLevel)}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-semibold text-[var(--foreground)]">{post.title}</h3>
                      {post.excerpt ? (
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                    آخر تحديث: {formatDate(post.publishedAt ?? post.updatedAt)}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                  <span>الكاتب: {post.author.name}</span>
                  <span>@{post.author.username}</span>
                  {post.category ? <span>التصنيف: {post.category.name}</span> : null}
                </div>

                <div className="mt-5 flex flex-wrap gap-3">
                  <Link
                    className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
                    href={`/posts/${post.slug}`}
                  >
                    عرض الصفحة
                  </Link>

                  {post.status === PostStatus.PENDING ? (
                    <>
                      <form action={reviewContentAction.bind(null, post.id, PostStatus.PUBLISHED)}>
                        <SubmitButton
                          className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700"
                          idleLabel="نشر الآن"
                          pendingLabel="جارٍ النشر..."
                        />
                      </form>
                      <form action={reviewContentAction.bind(null, post.id, PostStatus.REJECTED)}>
                        <SubmitButton
                          className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700"
                          idleLabel="إرجاع للمراجعة"
                          pendingLabel="جارٍ الرفض..."
                        />
                      </form>
                    </>
                  ) : null}

                  <form action={deleteContentAdminAction.bind(null, post.id)}>
                    <SubmitButton
                      className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                      idleLabel="حذف"
                      pendingLabel="جارٍ الحذف..."
                    />
                  </form>
                </div>
              </article>
            ))
          )}
        </div>
      </Surface>
    </div>
  );
}
