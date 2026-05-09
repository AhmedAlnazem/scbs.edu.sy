import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/session";
import { LoginForm } from "@/app/login/LoginForm";
import styles from "./page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المشاريع", href: "/#modules" },
  { label: "المكتبة الرقمية", href: "/#library" },
  { label: "لوحة التحكم", href: "/dashboard" },
];

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect("/dashboard");
  }

  const nextPath = typeof params.next === "string" ? params.next : undefined;
  const studentHref = nextPath ? `/login/student?next=${encodeURIComponent(nextPath)}` : "/login/student";
  const teacherHref = nextPath ? `/login/teacher?next=${encodeURIComponent(nextPath)}` : "/login/teacher";

  return (
    <main className={styles.page}>
      <header className={styles.newnavbar}>
        <div className={styles.navInner}>
          <nav aria-label="Main navigation" className={styles.navMenu}>
            {navItems.map((item) => (
              <Link key={item.label} className={styles.navLink} href={item.href}>
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
            <Link className={styles.loginLink} href="/register">
              <span aria-hidden="true" className={styles.loginIcon} />
              إنشاء حساب طالب
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>تسجيل دخول الطالب</span>
            <h1 className={styles.title}>دخول الطلاب</h1>
            <p className={styles.description}>
              هذه الصفحة أصبحت متزامنة مع صفحات الدخول الأخرى. يمكنك التبديل من الأعلى بين
              دخول الطلاب ودخول المعلمين والإدارة مع بقاء نفس بنية النموذج.
            </p>

            <div className={styles.infoPanel}>
              <p className={styles.infoTitle}>دخول متزامن</p>
              <p>الطالب يدخل من هذه البوابة بشكل افتراضي.</p>
              <p>يمكن التبديل مباشرة إلى بوابة المعلمين والإدارة من الشريط أعلى النموذج.</p>
            </div>
          </div>

          <div className={styles.formCard}>
            <div className={styles.loginModeSwitch}>
              <Link
                className={`${styles.loginModeLink} ${styles.loginModeLinkActive}`}
                href={studentHref}
              >
                دخول الطالب
              </Link>
              <Link className={styles.loginModeLink} href={teacherHref}>
                دخول المعلمين والإدارة
              </Link>
            </div>
            <LoginForm mode="student" nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}
