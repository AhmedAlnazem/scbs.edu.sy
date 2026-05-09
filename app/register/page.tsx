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

export default async function RegisterPage() {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

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
            <Link className={styles.loginLink} href="/login">
              <span aria-hidden="true" className={styles.loginIcon} />
              تسجيل الدخول إلى المنصة
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.heroSection}>
        <div className={styles.heroShell}>
          <div className={styles.heroCopy}>
            <span className={styles.eyebrow}>Register Portal</span>
            <h1 className={styles.title}>إنشاء حساب جديد</h1>
            <p className={styles.description}>
              أنشئ حسابك للوصول إلى المنصة. يتم إنشاء الحسابات الجديدة بصلاحية طالب بشكل
              افتراضي مع حفظ كلمة المرور بشكل آمن داخل النظام.
            </p>

            <div className={styles.infoPanel}>
              <p className={styles.infoTitle}>التسجيل ضمن نفس الهوية البصرية</p>
              <p>واجهة التسجيل الآن مطابقة لتصميم الصفحة الرئيسية وصفحة تسجيل الدخول.</p>
              <p>بعد إنشاء الحساب سيتم تسجيل دخولك مباشرة ونقلك إلى لوحة التحكم.</p>
              <p className={styles.registerText}>
                لديك حساب بالفعل؟ <Link href="/login">الانتقال إلى صفحة تسجيل الدخول</Link>
              </p>
            </div>
          </div>

          <div className={styles.formCard}>
            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
