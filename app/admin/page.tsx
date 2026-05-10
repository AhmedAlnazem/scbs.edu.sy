import Link from "next/link";

import { PostStatus, Role } from "@/generated/prisma";
import { formatDate } from "@/app/_components/content-ui";
import { listRecentAuditEntries } from "@/app/_lib/audit";
import { roleLabels } from "@/app/_lib/labels";
import { listAllPosts, listUsersWithPostCounts } from "@/app/_lib/posts";
import { requirePageRole, withOwnerAccess } from "@/app/_lib/session";
import styles from "./admin.module.css";

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
    valueLabel: "ينتظر قرار الإدارة أو المعلم",
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
    valueLabel: "يتطلب تعديلًا قبل الإرسال مجددًا",
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
    <div className={styles.overview}>
      <section className={styles.overviewHero}>
        <div className={styles.panelHeader}>
          <span className={styles.kicker}>Control Center</span>
          <h2 className={styles.overviewTitle}>لوحة إدارة بنَفَس المنصة الرئيسية</h2>
          <p className={styles.overviewText}>
            نفس العائلة البصرية المستخدمة في الصفحة الرئيسية، لكن بتركيز أعلى على الإحصاءات،
            حركة النشر، وسرعة الوصول إلى القرارات التنفيذية.
          </p>
        </div>

        <div className={styles.statsGrid}>
          <article className={styles.statCard}>
            <p className={styles.statLabel}>كل المنشورات</p>
            <p className={styles.statValue}>{totalPosts}</p>
            <p className={styles.statText}>
              {publishedCount} منشور جاهز و{reviewLoad} مادة تحتاج متابعة.
            </p>
          </article>

          <article className={styles.statCard}>
            <p className={styles.statLabel}>المستخدمون النشطون</p>
            <p className={styles.statValue}>{activeUsers.length}</p>
            <p className={styles.statText}>من أصل {users.length} حساب داخل المنصة.</p>
          </article>

          <article className={styles.statCard}>
            <p className={styles.statLabel}>ضغط المراجعة</p>
            <p className={styles.statValue}>{reviewLoad}</p>
            <p className={styles.statText}>
              {pendingCount} ينتظر قرارًا و{rejectedCount} يحتاج إعادة عمل.
            </p>
          </article>
        </div>
      </section>

      <div className={styles.stripGrid}>
        {statusCards.map(({ key, count }) => {
          const meta = statusMeta[key];
          const share = percentOf(count, totalPosts);

          return (
            <article key={key} className={styles.stripCard}>
              <div className={styles.stripTop}>
                <span className={`${styles.stripPill} ${meta.chipClass}`}>{meta.accent}</span>
                <span className="text-sm text-[var(--muted)]">{share}%</span>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">{meta.label}</p>
                <p className="mt-2 text-4xl font-semibold tracking-tight text-[var(--foreground)]">
                  {count}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--muted)]">{meta.valueLabel}</p>
              </div>
              <div className="h-2 rounded-full bg-black/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${meta.barClass}`}
                  style={{ width: `${Math.max(share, count > 0 ? 8 : 0)}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className={styles.columns}>
        <section className={styles.softPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.kicker}>Audit Trail</span>
            <h3 className="mt-4 text-3xl font-semibold text-[var(--green3)]">التدفق التشغيلي الأخير</h3>
            <p className="mt-3 text-[rgba(0,38,35,0.72)] leading-8">
              آخر العمليات المنفذة عبر النظام مع هوية المنفذ وسياق القرار. هذه المنطقة يجب أن
              تكشف الاختناقات بسرعة لا أن تزيد التشويش.
            </p>
          </div>

          <div className={styles.cardStack}>
            {logs.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6 text-sm text-[var(--muted)]">
                لا توجد سجلات بعد. ستظهر هنا كل عمليات الإنشاء والمراجعة والحذف وتعديل الأدوار.
              </div>
            ) : (
              logs.map((log, index) => (
                <article
                  key={log.id}
                  className="rounded-[24px] border border-[var(--line)] bg-white/78 p-5 shadow-[0_10px_22px_rgba(0,38,35,0.05)]"
                >
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

                  <h4 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
                    {log.entityLabel}
                  </h4>
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
        </section>

        <div className="grid gap-6">
          <section className={styles.softPanelAlt}>
            <div className={styles.panelHeader}>
              <span className={styles.kicker}>Quick Actions</span>
              <h3 className="mt-4 text-2xl font-semibold text-[var(--green3)]">الوصول السريع</h3>
            </div>

            <div className={styles.actionCards}>
              <Link className={styles.actionCard} href="/admin/posts">
                <strong className="text-[var(--green3)]">إدارة المنشورات</strong>
                <span className="text-sm leading-7 text-[var(--muted)]">
                  مراجعة المحتوى، النشر، الرفض، والحذف من شاشة واحدة.
                </span>
              </Link>

              <Link className={styles.actionCard} href="/admin/users">
                <strong className="text-[var(--green3)]">إدارة المستخدمين</strong>
                <span className="text-sm leading-7 text-[var(--muted)]">
                  تعديل الأدوار، إضافة الحسابات، ومتابعة المساهمين الأكثر نشاطًا.
                </span>
              </Link>
            </div>

            <div className={styles.pulsePanel}>
              <div className="flex items-center justify-between gap-3">
                <span>نسبة المنشور</span>
                <strong>{percentOf(publishedCount, totalPosts)}%</strong>
              </div>
              <div className={styles.pulseBar}>
                <span style={{ width: `${percentOf(publishedCount, totalPosts)}%` }} />
              </div>
              <p className="mt-3 text-sm leading-7 text-white/82">
                كلما اقتربت هذه النسبة من الاستقرار، خف ضغط المراجعة وتحسن تدفق المحتوى عبر
                المنصة.
              </p>
            </div>
          </section>

          <section className={styles.softPanelAlt}>
            <div className={styles.panelHeader}>
              <span className={styles.kicker}>Contributors</span>
              <h3 className="mt-4 text-2xl font-semibold text-[var(--green3)]">الأكثر مساهمة</h3>
            </div>

            <div className={styles.cardStack}>
              {topUsers.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-[var(--line)] bg-white/60 px-5 py-6 text-sm text-[var(--muted)]">
                  لا يوجد نشاط نشر بعد.
                </div>
              ) : (
                topUsers.map((user, index) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between gap-4 rounded-[24px] border border-[var(--line)] bg-white/78 px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#427f77,#094239)] text-sm font-semibold text-white">
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
          </section>

          <section className={styles.softPanelAlt}>
            <div className={styles.panelHeader}>
              <span className={styles.kicker}>Latest Posts</span>
              <h3 className="mt-4 text-2xl font-semibold text-[var(--green3)]">آخر المواد المتحركة</h3>
            </div>

            <div className={styles.cardStack}>
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

                  <h4 className="mt-3 text-lg font-semibold text-[var(--foreground)]">{post.title}</h4>
                  <p className="mt-2 text-sm text-[var(--muted)]">الكاتب: {post.author.name}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
