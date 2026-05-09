import Link from "next/link";

import {
  libraryGrades,
} from "@/app/_lib/library";
import { getCurrentUser } from "@/app/_lib/session";
import styles from "./page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشورات", href: "/posts" },
  { label: "الأبحاث", href: "/research" },
  { label: "الأكواد", href: "/codes" },
  { label: "المكتبة", href: "/library", active: true },
];

export default async function LibraryPage() {
  const user = await getCurrentUser();

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

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <article className={styles.heroLead}>
            <span className={styles.heroEyebrow}>المكتبة</span>
            <h1 className={styles.heroTitle}>مكتبة الصفوف</h1>
            <p className={styles.heroText}>
              ادخل إلى مساحة منظمة حسب الصف الدراسي. بعد اختيار الصف فقط ستظهر لك
              أقسام المنشورات والأكواد والأبحاث والمشاريع المرتبطة به.
            </p>

            <div className={styles.heroMeta}>
              <span className={styles.metaItem}>{libraryGrades.length} صفوف دراسية</span>
              <span className={styles.metaItem}>اختيار الصف أولاً</span>
              <span className={styles.metaItem}>الأقسام تظهر بعد الدخول</span>
            </div>
          </article>

          <aside className={styles.heroSide}>
            <div className={styles.sideCard}>
              <span className={styles.sideLabel}>الوصول السريع</span>
              <div className={styles.sideLinks}>
                {libraryGrades.map((grade) => (
                  <Link key={grade.slug} className={styles.sideLink} href={`/library/${grade.slug}`}>
                    <span aria-hidden="true" className={styles.sideLinkIcon} />
                    {grade.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className={styles.sideNote}>
              <strong className={styles.sideNoteTitle}>آلية التصفح</strong>
              <p className={styles.sideNoteText}>
                اختر الصف أولًا، ثم افتح القسم المناسب من داخل صفحة الصف نفسها.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.cardsSection}>
        <div className={styles.cardsShell}>
          {libraryGrades.map((grade) => (
            <article key={grade.slug} className={styles.gradeCard}>
              <div className={styles.gradeTop}>
                <div className={styles.gradeBadge}>الصف الدراسي</div>
                <div className={styles.gradeHead}>
                  <h2 className={styles.gradeTitle}>{grade.label}</h2>
                  <span className={styles.gradeCount}>4 أقسام</span>
                </div>
              </div>

              <div className={styles.gradeBody}>
                <p className={styles.gradeText}>
                  اختر هذا الصف للدخول إلى مكتبته الداخلية، ثم افتح القسم الذي تريده من
                  داخل صفحة الصف.
                </p>

                <div className={styles.previewList}>
                  <span className={styles.previewItem}>المنشورات</span>
                  <span className={styles.previewItem}>الأبحاث</span>
                  <span className={styles.previewItem}>الأكواد</span>
                  <span className={styles.previewItem}>المشاريع</span>
                </div>

                <Link className={styles.gradeAction} href={`/library/${grade.slug}`}>
                  الدخول إلى {grade.label}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
