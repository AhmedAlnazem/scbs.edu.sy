import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/session";
import { ResetPasswordForm } from "@/app/login/ResetPasswordForm";
import styles from "@/app/login/page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "رجوع", href: "/login" },
];

type SearchParams = Promise<{ mode?: string; next?: string }>;

function normalizeMode(mode?: string) {
  return mode === "teacher" ? "teacher" : "student";
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect("/dashboard");
  }

  const mode = normalizeMode(typeof params.mode === "string" ? params.mode : undefined);
  const nextPath = typeof params.next === "string" ? params.next : undefined;
  const studentHref = nextPath
    ? `/login/student?next=${encodeURIComponent(nextPath)}`
    : "/login/student";
  const teacherHref = nextPath
    ? `/login/teacher?next=${encodeURIComponent(nextPath)}`
    : "/login/teacher";

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
            <span className={styles.brandSubtitle}>استعادة كلمة المرور</span>
          </div>

          <div className={styles.actionSlot}>
            <Link className={styles.loginLink} href={mode === "student" ? teacherHref : studentHref}>
              <span aria-hidden="true" className={styles.loginIcon} />
              {mode === "student" ? "دخول المعلمين والإدارة" : "دخول الطالب"}
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>استعادة الوصول</span>
            <h1 className={styles.title}>إعادة تعيين كلمة المرور</h1>
            <p className={styles.description}>
              إذا نسيت كلمة المرور، يمكنك تعيين كلمة جديدة من هنا باستخدام مفتاح الاستعادة المحلي
              المعرّف داخل ملف البيئة للتطبيق.
            </p>
          </div>

          <div className={styles.formCard}>
            <div className={styles.loginModeSwitch}>
              <Link
                className={`${styles.loginModeLink} ${mode === "student" ? styles.loginModeLinkActive : ""}`}
                href={`/login/reset?mode=student${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`}
              >
                استعادة الطالب
              </Link>
              <Link
                className={`${styles.loginModeLink} ${mode === "teacher" ? styles.loginModeLinkActive : ""}`}
                href={`/login/reset?mode=teacher${nextPath ? `&next=${encodeURIComponent(nextPath)}` : ""}`}
              >
                استعادة المعلمين والإدارة
              </Link>
            </div>
            <ResetPasswordForm mode={mode} nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}
