import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/session";
import { LoginForm } from "@/app/login/LoginForm";
import styles from "@/app/login/page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "رجوع", href: "/login" },
];

export default async function TeacherLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect("/dashboard");
  }

  const nextPath = typeof params.next === "string" ? params.next : undefined;

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
            <span className={styles.brandSubtitle}>بوابة المعلمين والإدارة</span>
          </div>

          <div className={styles.actionSlot}>
            <Link className={styles.loginLink} href="/login/student">
              <span aria-hidden="true" className={styles.loginIcon} />
              دخول الطالب
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>تسجيل دخول المعلم</span>
            <h1 className={styles.title}>دخول المعلمين والإدارة</h1>
            <p className={styles.description}>
              هذه البوابة مخصصة للمعلمين وحسابات الإدارة وowner. حسابات الطلاب لا يمكنها
              الدخول من هنا.
            </p>
          </div>

          <div className={styles.formCard}>
            <div className={styles.loginModeSwitch}>
              <Link className={styles.loginModeLink} href="/login/student">
                دخول الطالب
              </Link>
              <Link
                className={`${styles.loginModeLink} ${styles.loginModeLinkActive}`}
                href="/login/teacher"
              >
                دخول المعلمين والإدارة
              </Link>
            </div>
            <LoginForm mode="teacher" nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}
