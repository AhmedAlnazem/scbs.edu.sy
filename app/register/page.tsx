import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/_lib/session";
import { RegisterForm } from "@/app/register/RegisterForm";
import styles from "@/app/login/page.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المشاريع", href: "/#modules" },
  { label: "المكتبة الرقمية", href: "/#library" },
  { label: "لوحة التحكم", href: "/dashboard" },
];

function resolveMode(mode: string | undefined) {
  return mode === "teacher" ? "teacher" : "student";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (user) {
    redirect("/dashboard");
  }

  const mode = resolveMode(typeof params.mode === "string" ? params.mode : undefined);
  const isTeacher = mode === "teacher";
  const loginHref = isTeacher ? "/login/teacher" : "/login/student";
  const alternateHref = isTeacher ? "/register" : "/register?mode=teacher";

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
            <Link className={styles.loginLink} href={loginHref}>
              <span aria-hidden="true" className={styles.loginIcon} />
              تسجيل الدخول إلى المنصة
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              {isTeacher ? "Teacher Register Portal" : "Register Portal"}
            </span>
            <h1 className={styles.title}>
              {isTeacher ? "إنشاء حساب معلم جديد" : "إنشاء حساب جديد"}
            </h1>
            <p className={styles.description}>
              {isTeacher
                ? "أنشئ حساب المعلم باستخدام مفتاح التسجيل المخصص. سيتم تفعيل الحساب بدور معلم وتسجيل الدخول مباشرة بعد الإنشاء."
                : "أنشئ حسابك للوصول إلى المنصة. يتم إنشاء الحسابات الجديدة بصلاحية طالب بشكل افتراضي مع حفظ كلمة المرور بشكل آمن داخل النظام."}
            </p>

            <div className={styles.infoPanel}>
              <p className={styles.infoTitle}>
                {isTeacher ? "تسجيل مخصص للمعلمين" : "التسجيل ضمن نفس الهوية البصرية"}
              </p>
              <p>
                {isTeacher
                  ? "هذا المسار مخصص لحسابات المعلمين فقط، ويحتاج إلى مفتاح تسجيل صحيح قبل إنشاء الحساب."
                  : "واجهة التسجيل الآن مطابقة لتصميم الصفحة الرئيسية وصفحة تسجيل الدخول."}
              </p>
              <p>
                {isTeacher
                  ? "إذا كان لديك حساب بالفعل أو تم إنشاؤه لك من لوحة الإدارة، استخدم بوابة دخول المعلمين والإدارة."
                  : "بعد إنشاء الحساب سيتم تسجيل دخولك مباشرة ونقلك إلى لوحة التحكم."}
              </p>
              <p className={styles.registerText}>
                لديك حساب بالفعل؟ <Link href={loginHref}>الانتقال إلى صفحة تسجيل الدخول</Link>
              </p>
              <p className={styles.registerText}>
                {isTeacher ? "تريد إنشاء حساب طالب؟ " : "تريد إنشاء حساب معلم؟ "}
                <Link href={alternateHref}>
                  {isTeacher ? "الانتقال إلى تسجيل الطلاب" : "الانتقال إلى تسجيل المعلمين"}
                </Link>
              </p>
            </div>
          </div>

          <div className={styles.formCard}>
            <div className={styles.loginModeSwitch}>
              <Link
                className={`${styles.loginModeLink} ${!isTeacher ? styles.loginModeLinkActive : ""}`}
                href="/register"
              >
                حساب طالب
              </Link>
              <Link
                className={`${styles.loginModeLink} ${isTeacher ? styles.loginModeLinkActive : ""}`}
                href="/register?mode=teacher"
              >
                حساب معلم
              </Link>
            </div>
            <RegisterForm mode={mode} />
          </div>
        </div>
      </section>
    </main>
  );
}
