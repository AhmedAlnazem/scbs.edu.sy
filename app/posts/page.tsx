import Link from "next/link";

import { EmptyState, formatDate, tagNames } from "@/app/_components/content-ui";
import { listPublishedPosts } from "@/app/_lib/posts";
import { getCurrentUser } from "@/app/_lib/session";
import { postTypeLabels } from "@/app/_lib/labels";
import styles from "./page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشورات", href: "/posts", active: true },
  { label: "الأبحاث", href: "/research" },
  { label: "الأكواد", href: "/codes" },
];

export default async function PostsPage() {
  const [user, posts] = await Promise.all([getCurrentUser(), listPublishedPosts()]);

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
            <Link className={styles.loginLink} href={user ? "/dashboard" : "/login"}>
              <span aria-hidden="true" className={styles.loginIcon} />
              {user ? "الانتقال إلى لوحة التحكم" : "تسجيل الدخول إلى المنصة"}
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.sectionBlock} id="posts-grid">
        <div className={styles.sectionHeader}>
          <span className={styles.sectionKicker}>أرشيف المنشورات</span>
          <h2 className={styles.sectionTitle}>المنشورات</h2>
          <div className={styles.topActions}>
            <span className={styles.topMeta}>{posts.length} منشور منشور</span>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className={styles.emptyWrap}>
            <EmptyState
              title="لا توجد منشورات منشورة بعد"
              description="عند اعتماد أول منشور ونشره سيظهر هنا داخل الشبكة."
            />
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <Link key={post.id} className={styles.postCard} href={`/posts/${post.slug}`}>
                <div className={styles.postTop}>
                  <span className={styles.postType}>{postTypeLabels[post.type]}</span>
                  <span className={styles.postDate}>{formatDate(post.publishedAt ?? post.updatedAt)}</span>
                </div>

                <div className={styles.postMiddle}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postExcerpt}>{post.excerpt ?? "منشور منشور داخل المنصة."}</p>
                </div>

                <div className={styles.postBottom}>
                  <span className={styles.postMeta}>الكاتب: {post.author.name}</span>
                  {post.category ? (
                    <span className={styles.postMeta}>التصنيف: {post.category.name}</span>
                  ) : null}
                  {post.tags.length > 0 ? (
                    <span className={styles.postMetaWide}>الوسوم: {tagNames(post)}</span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
