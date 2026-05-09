import Link from "next/link";

import { PostStatus, Role } from "@/generated/prisma";
import { formatDate, PageIntro, Surface } from "@/app/_components/content-ui";
import { listRecentAuditEntries } from "@/app/_lib/audit";
import { roleLabels } from "@/app/_lib/labels";
import { listAllPosts, listUsersWithPostCounts } from "@/app/_lib/posts";
import { requirePageRole, withOwnerAccess } from "@/app/_lib/session";

type StatusKey = "published" | "pending" | "draft" | "rejected";

const statusMeta: Record<
  StatusKey,
  { label: string; valueLabel: string; accent: string; chipClass: string; barClass: string }
> = {
  published: {
    label: "المنشور",
    valueLabel: "محتوى ظاهر للطلاب والزوار",
    accent: "جاهز",
    chipClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    barClass: "from-emerald-500 via-emerald-600 to-emerald-700",
  },
  pending: {
    label: "قيد المراجعة",
    valueLabel: "ينتظر قرار المعلم أو الإدارة",
    accent: "مراجعة",
    chipClass: "border-amber-200 bg-amber-50 text-amber-700",
    barClass: "from-amber-400 via-amber-500 to-orange-500",
  },
  draft: {
    label: "المسودات",
    valueLabel: "لم تُرسل بعد للاعتماد",
    accent: "تحرير",
    chipClass: "border-slate-200 bg-slate-100 text-slate-700",
    barClass: "from-slate-500 via-slate-600 to-slate-700",
  },
  rejected: {
    label: "المرفوض",
    valueLabel: "يتطلب تعديلًا قبل إعادة الإرسال",
    accent: "تنبيه",
    chipClass: "border-rose-200 bg-rose-50 text-rose-700",
    barClass: "from-rose-500 via-rose-600 to-red-700",
  },
};

function percentOf(value: number, total: number) {
  if (total === 0) {
    return 0;
  }

  return Math.round((value / total) * 100);
}

function statusTone(status: PostStatus) {
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

export default async function AdminPage() {
  await requirePageRole(withOwnerAccess([Role.ADMIN]), "/admin");

  const [posts, users, logs] = await Promise.all([
    listAllPosts(),
    listUsersWithPostCounts(),
    listRecentAuditEntries(18),
  ]);

  const publishedCount = posts.filter((post) => post.status === PostStatus.PUBLISHED).length;
  const pendingCount = posts.filter((post) => post.status === PostStatus.PENDING).length;
  const draftCount = posts.filter((post) => post.status === PostStatus.DRAFT).length;
  const rejectedCount = posts.filter((post) => post.status === PostStatus.REJECTED).length;
  const latestPosts = posts.slice(0, 5);
  const activeUsers = users.filter((user) => user._count.posts > 0);
  const topUsers = [...activeUsers].sort((a, b) => b._count.posts - a._count.posts).slice(0, 5);
  const reviewLoad = pendingCount + rejectedCount;
  const totalPosts = posts.length;

  const statusCards = [
    { key: "published" as const, count: publishedCount },
    { key: "pending" as const, count: pendingCount },
    { key: "draft" as const, count: draftCount },
    { key: "rejected" as const, count: rejectedCount },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[34px] border border-[rgba(0,38,35,0.14)] bg-[linear-gradient(135deg,#103d38_0%,#0b322d_58%,#0a2925_100%)] p-6 text-white shadow-[0_24px_80px_rgba(0,38,35,0.18)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(163,71,45,0.18),transparent_22%)]" />

        <div className="relative grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">الإدارة</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                مركز قيادة المحتوى المدرسي
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
                واجهة واحدة لمتابعة حركة النشر، ضغط المراجعات، ونشاط الفريق قبل أن تتحول المشاكل
                الصغيرة إلى فوضى تشغيلية.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-white/70">كل المنشورات</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">{totalPosts}</p>
                <p className="mt-2 text-sm text-white/72">
                  {publishedCount} منشور جاهز و{reviewLoad} يحتاج متابعة
                </p>
              </div>

              <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-white/70">المستخدمون النشطون</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">{activeUsers.length}</p>
                <p className="mt-2 text-sm text-white/72">من أصل {users.length} حساب داخل المنصة</p>
              </div>

              <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                <p className="text-sm text-white/70">ضغط المراجعة</p>
                <p className="mt-3 text-4xl font-semibold tracking-tight">{reviewLoad}</p>
                <p className="mt-2 text-sm text-white/72">
                  {pendingCount} ينتظر قرارًا و{rejectedCount} يحتاج إعادة عمل
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 self-start">
            <div className="rounded-[30px] border border-[rgba(16,61,56,0.1)] bg-[rgba(255,250,242,0.94)] p-5 text-[var(--foreground)] shadow-[0_18px_36px_rgba(0,38,35,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                    إجراءات سريعة
                  </p>
                  <h2 className="mt-2 text-xl font-semibold">ماذا تريد أن تدير الآن؟</h2>
                </div>
                <div className="rounded-full border border-[rgba(0,38,35,0.08)] bg-white px-3 py-1 text-xs text-[var(--muted)]">
                  لوحة تنفيذ
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <Link
                  className="rounded-[22px] border border-[rgba(0,38,35,0.08)] bg-white px-4 py-4 transition hover:border-[rgba(66,127,119,0.3)] hover:shadow-[0_12px_28px_rgba(0,38,35,0.08)]"
                  href="/admin/posts"
                >
                  <p className="font-semibold text-[var(--foreground)]">إدارة المنشورات</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    مراجعة المحتوى، قبول النشر، وحذف المواد المتعثرة.
                  </p>
                </Link>

                <Link
                  className="rounded-[22px] border border-[rgba(0,38,35,0.08)] bg-white px-4 py-4 transition hover:border-[rgba(66,127,119,0.3)] hover:shadow-[0_12px_28px_rgba(0,38,35,0.08)]"
                  href="/admin/users"
                >
                  <p className="font-semibold text-[var(--foreground)]">إدارة المستخدمين</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    تتبع الأدوار، النشاط، والحسابات التي تحتاج ضبطًا.
                  </p>
                </Link>
              </div>
            </div>

            <div className="rounded-[30px] border border-white/12 bg-white/8 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                نبض المنصة
              </p>
              <div className="mt-4 space-y-3 text-sm text-white/82">
                <div className="flex items-center justify-between gap-3">
                  <span>نسبة المنشور</span>
                  <strong>{percentOf(publishedCount, totalPosts)}%</strong>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#7dd3a8,#f7f3ea)]"
                    style={{ width: `${percentOf(publishedCount, totalPosts)}%` }}
                  />
                </div>
                <p className="leading-7 text-white/72">
                  كلما اقتربت هذه النسبة من الاستقرار، خف ضغط المراجعة وتحسن تدفق النشر.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-4">
        {statusCards.map(({ key, count }) => {
          const meta = statusMeta[key];
          const share = percentOf(count, totalPosts);

          return (
            <article
              key={key}
              className="rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta.chipClass}`}
                >
                  {meta.accent}
                </span>
                <span className="text-sm text-[var(--muted)]">{share}%</span>
              </div>
              <p className="mt-5 text-sm text-[var(--muted)]">{meta.label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                {count}
              </p>
              <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{meta.valueLabel}</p>
              <div className="mt-4 h-2 rounded-full bg-black/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${meta.barClass}`}
                  style={{ width: `${Math.max(share, count > 0 ? 8 : 0)}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Surface className="bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <PageIntro
              eyebrow="Audit Trail"
              title="التدفق التشغيلي الأخير"
              description="آخر العمليات المنفذة عبر النظام مع هوية المنفذ وسياق القرار. هذا هو المكان الذي يكشف الاختناقات بسرعة."
            />
            <Link className="themeButton rounded-2xl px-4 py-3 text-sm font-medium" href="/admin/posts">
              فتح إدارة المنشورات
            </Link>
          </div>

          <div className="mt-8 space-y-4">
            {logs.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6 text-sm text-[var(--muted)]">
                لا توجد سجلات بعد. ستظهر هنا كل عمليات الإنشاء والمراجعة والحذف وتعديل الأدوار.
              </div>
            ) : (
              logs.map((log, index) => (
                <article
                  key={log.id}
                  className="relative overflow-hidden rounded-[26px] border border-[var(--line)] bg-[var(--surface-strong)] p-5"
                >
                  <div className="absolute inset-y-0 right-0 w-1 bg-[linear-gradient(180deg,rgba(66,127,119,0.9),rgba(163,71,45,0.8))]" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[rgba(163,71,45,0.16)] bg-[rgba(163,71,45,0.08)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                        {log.action}
                      </span>
                      <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {log.entityType}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--muted)]">
                      #{String(index + 1).padStart(2, "0")} • {formatDate(log.createdAt)}
                    </span>
                  </div>

                  <h3 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
                    {log.entityLabel}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    المنفذ: {log.actorName} ({roleLabels[log.actorRole]})
                  </p>
                  {log.details ? (
                    <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{log.details}</p>
                  ) : null}
                </article>
              ))
            )}
          </div>
        </Surface>

        <div className="space-y-6">
          <Surface className="bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,239,229,0.92))]">
            <PageIntro
              eyebrow="Contributors"
              title="الأكثر مساهمة"
              description="أسماء الحسابات التي تدفع حركة المحتوى فعليًا داخل المنصة."
            />

            <div className="mt-8 space-y-3">
              {topUsers.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6 text-sm text-[var(--muted)]">
                  لا يوجد نشاط نشر بعد.
                </div>
              ) : (
                topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--line)] bg-white/72 px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f5148,#094239)] text-sm font-semibold text-white">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--foreground)]">{user.name}</p>
                        <p className="mt-1 text-sm text-[var(--muted)]">
                          @{user.username} • {roleLabels[user.role]}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--foreground)]">
                      {user._count.posts} منشور
                    </div>
                  </div>
                ))
              )}
            </div>
          </Surface>

          <Surface className="bg-[linear-gradient(180deg,rgba(255,250,242,0.96),rgba(255,255,255,0.92))]">
            <PageIntro
              eyebrow="Latest Posts"
              title="آخر المواد المتحركة"
              description="آخر ما دخل دورة التحرير أو النشر مع حالة كل مادة."
            />

            <div className="mt-8 space-y-3">
              {latestPosts.map((post) => (
                <Link
                  key={post.id}
                  href="/admin/posts"
                  className="block rounded-[24px] border border-[var(--line)] bg-white/78 p-5 transition hover:border-[rgba(66,127,119,0.28)] hover:shadow-[0_14px_30px_rgba(0,38,35,0.08)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
                      {post.type} • {formatDate(post.updatedAt)}
                    </p>
                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(post.status)}`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <h3 className="mt-3 text-lg font-semibold text-[var(--foreground)]">
                    {post.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">الكاتب: {post.author.name}</p>
                </Link>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
