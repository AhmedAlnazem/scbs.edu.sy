import Link from "next/link";

import { formatDate, tagNames } from "@/app/_components/content-ui";
import { getLibraryGradeLabel, libraryGrades } from "@/app/_lib/library";
import { postTypeLabels } from "@/app/_lib/labels";
import { listPublishedPosts } from "@/app/_lib/posts";
import { getCurrentUser } from "@/app/_lib/session";
import { HomeAccountMenu } from "@/app/components/HomeAccountMenu";
import HeroSlider from "@/app/components/HeroSlider";
import styles from "./page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/", active: true },
  { label: "المشاريع", href: "#showcase" },
  { label: "المكتبة الرقمية", href: "#library" },
  { label: "المحتوى المباشر", href: "#live-content" },
];

export default async function Home(): Promise<React.JSX.Element> {
  const [user, posts] = await Promise.all([getCurrentUser(), listPublishedPosts()]);

  const featuredPosts = posts.slice(0, 6);
  const codePosts = posts.filter((post) => post.type === "CODE").slice(0, 3);
  const researchPosts = posts.filter((post) => post.type === "RESEARCH").slice(0, 2);
  const projectPosts = posts.filter((post) => post.type === "PROJECT").slice(0, 2);

  const libraryOverview = libraryGrades.map((grade) => {
    const gradePosts = posts.filter((post) => post.classLevel === grade.slug);
    const codesCount = gradePosts.filter((post) => post.type === "CODE").length;
    const researchCount = gradePosts.filter((post) => post.type === "RESEARCH").length;
    const projectsCount = gradePosts.filter((post) => post.type === "PROJECT").length;

    return {
      ...grade,
      total: gradePosts.length,
      latest: gradePosts[0] ?? null,
      codesCount,
      researchCount,
      projectsCount,
    };
  });

  const latestPost = featuredPosts[0] ?? null;

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

      <section aria-label="Software school banner" className={styles.schoolBanner}>
        <div className={styles.bannerGrid}>
          <article className={`${styles.bannerTile} ${styles.bannerLead}`}>
            <div className={styles.bannerContent}>
              <span className={styles.bannerKicker}>Live School Content</span>
              <h1 className={styles.bannerTitle}>المنصة لم تعد وصفًا نظريًا، بل محتوى حيًا قابلًا للتصفح</h1>
              <p className={styles.bannerText}>
                الصفحة الرئيسية تعرض الآن أحدث المشاريع والأبحاث والأكواد وامتدادها داخل المكتبة،
                بحيث ترى المادة المنشورة فعليًا بدل كتل تعريفية ثابتة.
              </p>

              <div className={styles.bannerMeta}>
                <span className={styles.metaItem}>{posts.length} عنصر منشور</span>
                <span className={styles.metaItem}>{codePosts.length} أمثلة كود جاهزة</span>
                <span className={styles.metaItem}>{libraryOverview.length} صفوف داخل المكتبة</span>
                <span className={styles.metaItem}>{latestPost ? "آخر تحديث مباشر" : "بانتظار نشر المحتوى"}</span>
              </div>

              <div className={styles.bannerActions}>
                <Link className={styles.bannerPrimaryAction} href="#showcase">
                  تصفح المحتوى المباشر
                </Link>
                <Link className={styles.bannerSecondaryAction} href="/library">
                  الدخول إلى المكتبة
                </Link>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section aria-labelledby="library-title" className={styles.sectionBlock} id="library">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Library Snapshot</span>
          <h2 className={styles.sectionTitle} id="library-title">
            المكتبة والصفوف مرتبطة بنفس المحتوى المنشور
          </h2>
          <p className={styles.sectionText}>
            كل صف يعرض ما بداخله من مشاريع وأبحاث وأكواد، مع آخر عنصر منشور يقودك مباشرة إلى صفحة
            المكتبة أو الصفحة التفصيلية للمحتوى.
          </p>
        </div>

        <div className={styles.libraryGrid}>
          {libraryOverview.map((grade) => (
            <article key={grade.slug} className={styles.libraryCard}>
              <div className={styles.libraryCardTop}>
                <span className={styles.libraryBadge}>{grade.label}</span>
                <span className={styles.libraryCount}>{grade.total} عنصر</span>
              </div>

              <div className={styles.libraryMetrics}>
                <span>أكواد: {grade.codesCount}</span>
                <span>أبحاث: {grade.researchCount}</span>
                <span>مشاريع: {grade.projectsCount}</span>
              </div>

              <Link className={styles.libraryAction} href={`/library/${grade.slug}`}>
                فتح مكتبة {grade.label}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="showcase-title" className={styles.sectionBlock} id="showcase">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Mixed Showcase</span>
          <h2 className={styles.sectionTitle} id="showcase-title">
            عرض مختلط من المنشورات والأبحاث والمشاريع
          </h2>
          <p className={styles.sectionText}>
            هذه البطاقات تسحب مباشرة من المحتوى المنشور داخل المنصة، مع خلط أنواع المحتوى بدل
            الاكتفاء بوصف عام عنها.
          </p>
        </div>

        {featuredPosts.length === 0 ? (
          <div className={styles.emptyPanel}>
            <p className={styles.emptyTitle}>لا يوجد محتوى منشور بعد</p>
            <p className={styles.emptyText}>
              بعد نشر أول مشروع أو بحث أو كود سيظهر هنا تلقائيًا ضمن الواجهة الرئيسية.
            </p>
          </div>
        ) : (
          <div className={styles.showcaseGrid}>
            {featuredPosts.map((post, index) => (
              <Link
                key={post.id}
                className={`${styles.showcaseCard} ${index === 0 ? styles.showcaseCardLead : ""}`}
                href={`/posts/${post.slug}`}
              >
                <div className={styles.showcaseTop}>
                  <span className={styles.showcaseType}>{postTypeLabels[post.type]}</span>
                  <span className={styles.showcaseDate}>
                    {formatDate(post.publishedAt ?? post.updatedAt)}
                  </span>
                </div>

                <div className={styles.showcaseBody}>
                  <h3 className={styles.showcaseTitle}>{post.title}</h3>
                  <p className={styles.showcaseExcerpt}>
                    {post.excerpt ?? "محتوى منشور داخل المنصة مع تفاصيل إضافية في الصفحة الكاملة."}
                  </p>
                </div>

                <div className={styles.showcaseMeta}>
                  <span>الكاتب: {post.author.name}</span>
                  <span>الصف: {getLibraryGradeLabel(post.classLevel)}</span>
                  {post.category ? <span>التصنيف: {post.category.name}</span> : null}
                  {post.tags.length > 0 ? <span>الوسوم: {tagNames(post)}</span> : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="live-content-title" className={styles.sectionBlock} id="live-content">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>Code + Research</span>
          <h2 className={styles.sectionTitle} id="live-content-title">
            أكواد وأبحاث ومشاريع في مسار واحد
          </h2>
          <p className={styles.sectionText}>
            بدلاً من أقسام وصفية منفصلة، هذه المنطقة تجمع ما يمكن فتحه مباشرة الآن من أقسام
            الكود والأبحاث والمشاريع.
          </p>
        </div>

        <div className={styles.mixedColumns}>
          <div className={styles.columnPanel}>
            <div className={styles.columnHead}>
              <h3 className={styles.columnTitle}>أحدث الأكواد</h3>
              <Link className={styles.columnLink} href="/codes">
                عرض كل الأكواد
              </Link>
            </div>

            <div className={styles.stackList}>
              {codePosts.length === 0 ? (
                <div className={styles.stackEmpty}>لا توجد مشاركات كود منشورة بعد.</div>
              ) : (
                codePosts.map((post) => (
                  <Link key={post.id} className={styles.stackItem} href={`/posts/${post.slug}`}>
                    <strong>{post.title}</strong>
                    <span>{post.author.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className={styles.columnPanel}>
            <div className={styles.columnHead}>
              <h3 className={styles.columnTitle}>أحدث الأبحاث</h3>
              <Link className={styles.columnLink} href="/research">
                عرض قسم الأبحاث
              </Link>
            </div>

            <div className={styles.stackList}>
              {researchPosts.length === 0 ? (
                <div className={styles.stackEmpty}>لا توجد أبحاث منشورة بعد.</div>
              ) : (
                researchPosts.map((post) => (
                  <Link key={post.id} className={styles.stackItem} href={`/posts/${post.slug}`}>
                    <strong>{post.title}</strong>
                    <span>{post.author.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>

          <div className={styles.columnPanel}>
            <div className={styles.columnHead}>
              <h3 className={styles.columnTitle}>أحدث المشاريع</h3>
              <Link className={styles.columnLink} href="/posts">
                عرض المنشورات
              </Link>
            </div>

            <div className={styles.stackList}>
              {projectPosts.length === 0 ? (
                <div className={styles.stackEmpty}>لا توجد مشاريع منشورة بعد.</div>
              ) : (
                projectPosts.map((post) => (
                  <Link key={post.id} className={styles.stackItem} href={`/posts/${post.slug}`}>
                    <strong>{post.title}</strong>
                    <span>{post.author.name}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <HeroSlider />
    </main>
  );
}
