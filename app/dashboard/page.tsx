import Link from "next/link";

import { PostStatus } from "@/generated/prisma";

import { EmptyState, MetricCard, PageIntro, PostCard } from "@/app/_components/content-ui";
import { listPostsByAuthor } from "@/app/_lib/posts";
import { requireUser } from "@/app/_lib/session";
import styles from "@/app/dashboard/dashboard.module.css";

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const posts = await listPostsByAuthor(user.id);

  const draftCount = posts.filter((post) => post.status === PostStatus.DRAFT).length;
  const pendingCount = posts.filter((post) => post.status === PostStatus.PENDING).length;
  const publishedCount = posts.filter((post) => post.status === PostStatus.PUBLISHED).length;

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="نظرة عامة"
        title="مركز المتابعة السريع"
        description="هذه اللوحة تعطيك نظرة عامة فقط. أما الإدارة الفعلية للمنشورات فانتقلت إلى مساحة مستقلة تحت manage/posts."
      />

      <div className={styles.statsGrid}>
        <MetricCard label="المسودات" value={draftCount} />
        <MetricCard label="بانتظار المراجعة" value={pendingCount} />
        <MetricCard label="المنشور" value={publishedCount} />
      </div>

      <div className={styles.quickGrid}>
        <article className={styles.quickCard}>
          <h3 className={styles.quickCardTitle}>إدارة المحتوى</h3>
          <p className={styles.quickCardText}>
            انتقل إلى مساحة الإدارة لإنشاء المنشورات وتعديلها ومتابعة حالتها.
          </p>
          <Link className={styles.quickCardLink} href="/manage/posts">
            فتح إدارة المنشورات
          </Link>
        </article>

        <article className={styles.quickCard}>
          <h3 className={styles.quickCardTitle}>إنشاء سريع</h3>
          <p className={styles.quickCardText}>
            ابدأ منشورًا جديدًا مباشرة داخل مساحة الإدارة المنفصلة عن صفحات العرض العامة.
          </p>
          <Link className={styles.quickCardLink} href="/manage/posts/new">
            إنشاء منشور جديد
          </Link>
        </article>
      </div>

      <section className={styles.listSection}>
        <PageIntro
          eyebrow="الأحدث"
          title="آخر العناصر"
          description="يمكنك من هنا الوصول السريع إلى آخر العناصر الخاصة بك داخل مساحة الإدارة."
        />

        <div className="mt-6 space-y-4">
          {posts.length === 0 ? (
            <EmptyState
              title="لا يوجد محتوى بعد"
              description="ابدأ من مساحة الإدارة لإضافة أول منشور داخل النظام."
            />
          ) : (
            posts
              .slice(0, 5)
              .map((post) => (
                <PostCard
                  key={post.id}
                  href={`/manage/posts/${post.id}/edit`}
                  post={post}
                  showStatus
                />
              ))
          )}
        </div>
      </section>
    </div>
  );
}
