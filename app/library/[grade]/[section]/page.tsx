import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, tagNames } from "@/app/_components/content-ui";
import {
  getLibraryGradeLabel,
  getLibrarySectionDescription,
  getLibrarySectionLabel,
  getPostTypeForLibrarySection,
  isLibraryGrade,
  isLibrarySection,
  librarySections,
} from "@/app/_lib/library";
import { postTypeLabels } from "@/app/_lib/labels";
import { listPublishedPostsByClassAndType } from "@/app/_lib/posts";
import { getCurrentUser } from "@/app/_lib/session";
import { HomeAccountMenu } from "@/app/components/HomeAccountMenu";
import styles from "../../library-route.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشورات", href: "/posts" },
  { label: "الأبحاث", href: "/research" },
  { label: "الأكواد", href: "/codes" },
  { label: "المكتبة", href: "/library", active: true },
];

export default async function LibrarySectionPage(
  props: PageProps<"/library/[grade]/[section]">,
) {
  const { grade, section } = await props.params;

  if (!isLibraryGrade(grade) || !isLibrarySection(section)) {
    notFound();
  }

  const [user, posts, siblingCounts] = await Promise.all([
    getCurrentUser(),
    listPublishedPostsByClassAndType(grade, getPostTypeForLibrarySection(section)),
    Promise.all(
      librarySections.map(async (entry) => ({
        ...entry,
        count: (
          await listPublishedPostsByClassAndType(grade, getPostTypeForLibrarySection(entry.slug))
        ).length,
      })),
    ),
  ]);

  const gradeLabel = getLibraryGradeLabel(grade);
  const sectionLabel = getLibrarySectionLabel(section);
  const latestPost = posts[0] ?? null;

  return (
    <main className={styles.page}>
      <header className={styles.newnavbar}>
        <div className={styles.navInner}>
          <nav aria-label="Main navigation" className={styles.navMenu}>
            {navItems.map((item) => (
              <Link
                key={item.label}
                className={`${styles.navLink} ${item.active ? styles.navLinkActive : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.brandBlock}>
            <span className={styles.brandTitle}>الجمهورية العربية السورية</span>
            <span className={styles.brandSubtitle}>
              ثانوية الحاسوب للبنين في سرمدا - محافظة إدلب
            </span>
          </div>

          <div className={styles.actionSlot}>
            <HomeAccountMenu user={user} />
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <article className={styles.heroLead}>
            <span className={styles.heroEyebrow}>Focused Section</span>
            <h1 className={styles.heroTitle}>
              {sectionLabel}
              <br />
              {gradeLabel}
            </h1>
            <p className={styles.heroText}>{getLibrarySectionDescription(section)}</p>

            <div className={styles.heroMeta}>
              <span className={styles.metaItem}>{posts.length} عنصر منشور</span>
              <span className={styles.metaItem}>{sectionLabel}</span>
              <span className={styles.metaItem}>{gradeLabel}</span>
              <span className={styles.metaItem}>
                {latestPost
                  ? `آخر نشر: ${formatDate(latestPost.publishedAt ?? latestPost.updatedAt)}`
                  : "بانتظار أول مادة"}
              </span>
            </div>

            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="#posts">
                عرض المحتوى
              </Link>
              <Link className={styles.secondaryAction} href={`/library/${grade}`}>
                العودة إلى صفحة الصف
              </Link>
            </div>
          </article>

          <aside className={styles.heroSide}>
            <div className={styles.sideCard}>
              <span className={styles.sideLabel}>أقسام الصف</span>
              <div className={styles.sideLinks}>
                {siblingCounts.map((entry) => (
                  <Link
                    key={entry.slug}
                    className={styles.sideLink}
                    href={`/library/${grade}/${entry.slug}`}
                  >
                    <span aria-hidden="true" className={styles.sideLinkIcon} />
                    {getLibrarySectionLabel(entry.slug)} ({entry.count})
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.sideNote}>
              <strong className={styles.sideNoteTitle}>تنقل سريع</strong>
              <p className={styles.sideNoteText}>
                إذا لم تجد ما تريد في هذا القسم، يمكنك الانتقال مباشرة إلى بقية أقسام {gradeLabel}
                من نفس الشريط الجانبي بدون الرجوع للخلف.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Section Metrics</span>
          <h2 className={styles.sectionTitle}>ملخص قسم {sectionLabel}</h2>
          <p className={styles.sectionText}>
            نظرة سريعة على حجم المحتوى داخل هذا القسم قبل استعراض البطاقات الكاملة في الأسفل.
          </p>
        </div>

        <div className={styles.metricGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>إجمالي العناصر</p>
            <p className={styles.metricValue}>{posts.length}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>نوع المحتوى</p>
            <p className={styles.metricValue}>{sectionLabel}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>الصف</p>
            <p className={styles.metricValue}>{gradeLabel}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>أحدث نشر</p>
            <p className={styles.metricValue}>
              {latestPost ? formatDate(latestPost.publishedAt ?? latestPost.updatedAt) : "لا يوجد"}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.sectionBlock} id="posts">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Published Items</span>
          <h2 className={styles.sectionTitle}>المحتوى المنشور في {sectionLabel}</h2>
          <p className={styles.sectionText}>
            تم ترتيب المواد الأحدث أولًا، مع نفس نمط العرض البصري الموجود في الواجهة الرئيسية.
          </p>
        </div>

        {posts.length === 0 ? (
          <div className={styles.emptyPanel}>
            <p className={styles.emptyTitle}>لا يوجد محتوى منشور</p>
            <p className={styles.emptyText}>
              عند نشر محتوى مرتبط بهذا القسم داخل {gradeLabel} سيظهر هنا تلقائيًا.
            </p>
          </div>
        ) : (
          <div className={styles.previewGrid}>
            {posts.map((post, index) => (
              <Link
                key={post.id}
                className={`${styles.postCard} ${index === 0 ? styles.previewLead : ""}`}
                href={`/posts/${post.slug}`}
              >
                <div className={styles.postTop}>
                  <span className={styles.postType}>{postTypeLabels[post.type]}</span>
                  <span className={styles.postDate}>
                    {formatDate(post.publishedAt ?? post.updatedAt)}
                  </span>
                </div>

                <h3 className={styles.postTitle}>{post.title}</h3>
                <p className={styles.postExcerpt}>
                  {post.excerpt ?? "محتوى منشور داخل هذا القسم مع تفاصيل إضافية في الصفحة الكاملة."}
                </p>

                <div className={styles.postMeta}>
                  <span>الكاتب: {post.author.name}</span>
                  <span>الصف: {gradeLabel}</span>
                  {post.category ? <span>التصنيف: {post.category.name}</span> : null}
                  {post.tags.length > 0 ? <span>الوسوم: {tagNames(post)}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
