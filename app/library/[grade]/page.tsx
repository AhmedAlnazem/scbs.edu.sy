import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, tagNames } from "@/app/_components/content-ui";
import {
  getLibraryGradeLabel,
  getLibrarySectionDescription,
  getLibrarySectionLabel,
  getPostTypeForLibrarySection,
  isLibraryGrade,
  librarySections,
} from "@/app/_lib/library";
import { postTypeLabels } from "@/app/_lib/labels";
import { listPublishedPostsByClass, listPublishedPostsByClassAndType } from "@/app/_lib/posts";
import { getCurrentUser } from "@/app/_lib/session";
import { HomeAccountMenu } from "@/app/components/HomeAccountMenu";
import styles from "../library-route.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشورات", href: "/posts" },
  { label: "الأبحاث", href: "/research" },
  { label: "الأكواد", href: "/codes" },
  { label: "المكتبة", href: "/library", active: true },
];

export default async function LibraryGradePage(props: PageProps<"/library/[grade]">) {
  const { grade } = await props.params;

  if (!isLibraryGrade(grade)) {
    notFound();
  }

  const [user, posts, sectionEntries] = await Promise.all([
    getCurrentUser(),
    listPublishedPostsByClass(grade),
    Promise.all(
      librarySections.map(async (section) => {
        const sectionPosts = await listPublishedPostsByClassAndType(
          grade,
          getPostTypeForLibrarySection(section.slug),
        );

        return {
          ...section,
          count: sectionPosts.length,
          latest: sectionPosts[0] ?? null,
        };
      }),
    ),
  ]);

  const latestPosts = posts.slice(0, 3);
  const gradeLabel = getLibraryGradeLabel(grade);
  const activeSections = sectionEntries.filter((entry) => entry.count > 0).length;

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
            <span className={styles.heroEyebrow}>Grade Library</span>
            <h1 className={styles.heroTitle}>{gradeLabel}</h1>
            <p className={styles.heroText}>
              هذه الصفحة تجمع محتوى {gradeLabel} بنفس أسلوب الواجهة الرئيسية: أقسام واضحة،
              إحصاءات مباشرة، وأحدث ما نُشر داخل الصف للوصول السريع إلى المادة المطلوبة.
            </p>

            <div className={styles.heroMeta}>
              <span className={styles.metaItem}>{posts.length} عنصر منشور</span>
              <span className={styles.metaItem}>{librarySections.length} أقسام متاحة</span>
              <span className={styles.metaItem}>{activeSections} أقسام فيها محتوى</span>
              <span className={styles.metaItem}>
                {posts[0] ? `آخر نشر: ${formatDate(posts[0].publishedAt ?? posts[0].updatedAt)}` : "بانتظار أول نشر"}
              </span>
            </div>

            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="#sections">
                استعراض الأقسام
              </Link>
              <Link className={styles.secondaryAction} href="/library">
                العودة إلى كل الصفوف
              </Link>
            </div>
          </article>

          <aside className={styles.heroSide}>
            <div className={styles.sideCard}>
              <span className={styles.sideLabel}>الوصول السريع</span>
              <div className={styles.sideLinks}>
                {sectionEntries.map((section) => (
                  <Link
                    key={section.slug}
                    className={styles.sideLink}
                    href={`/library/${grade}/${section.slug}`}
                  >
                    <span aria-hidden="true" className={styles.sideLinkIcon} />
                    {getLibrarySectionLabel(section.slug)}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.sideNote}>
              <strong className={styles.sideNoteTitle}>ملخص الصف</strong>
              <p className={styles.sideNoteText}>
                افتح أي قسم لترى المحتوى الكامل، أو ابدأ من أحدث العناصر في الأسفل إذا كنت
                تريد نفس تجربة التصفح السريعة الموجودة في الصفحة الرئيسية.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Library Metrics</span>
          <h2 className={styles.sectionTitle}>صورة سريعة عن محتوى {gradeLabel}</h2>
          <p className={styles.sectionText}>
            قبل الدخول إلى كل قسم، هذه الأرقام تعطيك فكرة مباشرة عن كثافة المحتوى المنشور
            داخل هذا الصف.
          </p>
        </div>

        <div className={styles.metricGrid}>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>إجمالي المنشورات</p>
            <p className={styles.metricValue}>{posts.length}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>الأقسام النشطة</p>
            <p className={styles.metricValue}>{activeSections}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>الأقسام الجاهزة</p>
            <p className={styles.metricValue}>{librarySections.length}</p>
          </article>
          <article className={styles.metricCard}>
            <p className={styles.metricLabel}>أحدث المواد المعروضة</p>
            <p className={styles.metricValue}>{latestPosts.length}</p>
          </article>
        </div>
      </section>

      <section className={styles.sectionBlock} id="sections">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Section Access</span>
          <h2 className={styles.sectionTitle}>أقسام {gradeLabel}</h2>
          <p className={styles.sectionText}>
            كل بطاقة تقودك مباشرة إلى القسم المطلوب مع لمحة عن عدد العناصر وآخر مادة منشورة.
          </p>
        </div>

        <div className={styles.sectionGrid}>
          {sectionEntries.map((section) => (
            <article key={section.slug} className={styles.sectionCard}>
              <div className={styles.sectionTop}>
                <span className={styles.sectionBadge}>{getLibrarySectionLabel(section.slug)}</span>
                <span className={styles.sectionCount}>{section.count} عنصر</span>
              </div>

              <h3 className={styles.sectionCardTitle}>{getLibrarySectionLabel(section.slug)}</h3>
              <p className={styles.sectionDescription}>
                {getLibrarySectionDescription(section.slug)}
              </p>
              <p className={styles.sectionPreview}>
                {section.latest
                  ? `آخر مادة: ${section.latest.title}`
                  : "لا يوجد محتوى منشور في هذا القسم حتى الآن."}
              </p>

              <Link
                className={styles.sectionAction}
                href={`/library/${grade}/${section.slug}`}
              >
                فتح القسم
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Latest Content</span>
          <h2 className={styles.sectionTitle}>أحدث ما نُشر داخل {gradeLabel}</h2>
          <p className={styles.sectionText}>
            هذه المنطقة تعرض أحدث المواد من مختلف أنواع المحتوى داخل الصف بنفس منطق البطاقات
            الموجودة في الصفحة الرئيسية.
          </p>
        </div>

        {latestPosts.length === 0 ? (
          <div className={styles.emptyPanel}>
            <p className={styles.emptyTitle}>لا يوجد محتوى منشور بعد</p>
            <p className={styles.emptyText}>
              عند نشر أول مادة ضمن هذا الصف ستظهر هنا تلقائيًا مع روابط مباشرة للتفاصيل.
            </p>
          </div>
        ) : (
          <div className={styles.previewGrid}>
            {latestPosts.map((post, index) => (
              <Link
                key={post.id}
                className={`${styles.previewCard} ${index === 0 ? styles.previewLead : ""}`}
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
                  {post.excerpt ?? "محتوى منشور داخل هذا الصف مع تفاصيل إضافية في الصفحة الكاملة."}
                </p>

                <div className={styles.postMeta}>
                  <span>الكاتب: {post.author.name}</span>
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
