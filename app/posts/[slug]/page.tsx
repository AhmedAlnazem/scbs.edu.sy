import Link from "next/link";
import { notFound } from "next/navigation";

import { formatDate, tagNames } from "@/app/_components/content-ui";
import { postTypeLabels } from "@/app/_lib/labels";
import { readMediaUrls } from "@/app/_lib/post-media";
import { getPublishedPostBySlug } from "@/app/_lib/posts";
import { getCurrentUser } from "@/app/_lib/session";
import styles from "./page.module.css";

const navItems = [
  { label: "الصفحة الرئيسية", href: "/" },
  { label: "المنشورات", href: "/posts", active: true },
  { label: "الأبحاث", href: "/research" },
  { label: "الأكواد", href: "/codes" },
];

export default async function PostDetailPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;
  const [user, post] = await Promise.all([getCurrentUser(), getPublishedPostBySlug(slug)]);

  if (!post) {
    notFound();
  }

  const imageUrls = readMediaUrls(post.imageUrls);
  const videoUrls = readMediaUrls(post.videoUrls);
  const fileUrls = readMediaUrls(post.fileUrls);

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

      <section className={styles.contentSection}>
        <div className={styles.contentShell}>
          <div className={styles.contentMain}>
            <div className={styles.contentIntro}>
              <span className={styles.contentKicker}>المحتوى الكامل</span>
            </div>

            <article className={styles.articleCard}>
              {post.coverImage ? (
                <div className={styles.mediaBlock}>
                  <h2 className={styles.mediaTitle}>صورة الغلاف</h2>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img alt={post.title} className={styles.articleImage} src={post.coverImage} />
                </div>
              ) : null}

              {imageUrls.length > 0 ? (
                <div className={styles.mediaBlock}>
                  <h2 className={styles.mediaTitle}>الصور</h2>
                  <div className={styles.imageGrid}>
                    {imageUrls.map((url) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={url} alt={post.title} className={styles.galleryImage} src={url} />
                    ))}
                  </div>
                </div>
              ) : null}

              {videoUrls.length > 0 ? (
                <div className={styles.mediaBlock}>
                  <h2 className={styles.mediaTitle}>الفيديوهات</h2>
                  <div className={styles.videoList}>
                    {videoUrls.map((url) =>
                      /\.(mp4|webm|ogg)$/i.test(url) ? (
                        <video key={url} className={styles.videoPlayer} controls src={url} />
                      ) : (
                        <a
                          key={url}
                          className={styles.mediaLink}
                          href={url}
                          rel="noreferrer"
                          target="_blank"
                        >
                          فتح الفيديو
                        </a>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {fileUrls.length > 0 ? (
                <div className={styles.mediaBlock}>
                  <h2 className={styles.mediaTitle}>الملفات المرفقة</h2>
                  <div className={styles.fileList}>
                    {fileUrls.map((url, index) => (
                      <a
                        key={url}
                        className={styles.mediaLink}
                        href={url}
                        rel="noreferrer"
                        target="_blank"
                      >
                        ملف {index + 1}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              <pre className={styles.articleText}>{post.content}</pre>
            </article>
          </div>

          <aside className={styles.overviewSide}>
            <article className={styles.overviewLead}>
              <span className={styles.overviewEyebrow}>تفاصيل المنشور</span>
              <h1 className={styles.overviewTitle}>{post.title}</h1>
              <p className={styles.overviewDescription}>
                {post.excerpt ?? "عرض مباشر للمنشور المنشور مع بياناته الأساسية ومحتواه الكامل."}
              </p>
            </article>

            <div className={styles.sideCard}>
              <div className={styles.infoRow}>
                <span className={styles.sideLabel}>النوع</span>
                <strong className={styles.sideValue}>{postTypeLabels[post.type]}</strong>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.sideLabel}>التاريخ</span>
                <strong className={styles.sideValue}>
                  {formatDate(post.publishedAt ?? post.updatedAt)}
                </strong>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.sideLabel}>الكاتب</span>
                <strong className={styles.sideValue}>{post.author.name}</strong>
              </div>
            </div>

            <div className={`${styles.sideCard} ${styles.sideCardInline}`}>
              <span className={styles.sideLabel}>التصنيف</span>
              <strong className={styles.sideValue}>{post.category?.name ?? "بدون تصنيف"}</strong>
            </div>

            <div className={`${styles.sideCard} ${styles.sideCardInline}`}>
              <span className={styles.sideLabel}>الوسوم</span>
              <strong className={styles.sideValue}>
                {post.tags.length > 0 ? tagNames(post) : "لا توجد وسوم"}
              </strong>
            </div>

            <div className={styles.sideCard}>
              <span className={styles.sideLabel}>التنقل</span>
              <div className={styles.sideActions}>
                <Link className={styles.sideActionPrimary} href="/posts">
                  الرجوع إلى جميع المنشورات
                </Link>
                {user ? (
                  <Link className={styles.sideActionSecondary} href="/manage/posts">
                    الانتقال إلى الإدارة
                  </Link>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
