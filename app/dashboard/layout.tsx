import Link from "next/link";

import { requireUser } from "@/app/_lib/session";
import loginStyles from "@/app/login/page.module.css";
import styles from "@/app/dashboard/dashboard.module.css";

const navItems = [
  { label: "الرئيسية", href: "/" },
  { label: "المنشورات", href: "/posts" },
  { label: "الأبحاث", href: "/research" },
  { label: "الأكواد", href: "/codes" },
];

const dashboardItems = [
  { href: "/dashboard", label: "نظرة عامة" },
  { href: "/manage/posts", label: "إدارة المنشورات" },
  { href: "/manage/posts/new", label: "منشور جديد" },
];

function isActivePath(currentPath: string, href: string) {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

export default async function DashboardLayout(props: LayoutProps<"/dashboard">) {
  const user = await requireUser("/dashboard");
  const currentPath = "/dashboard";

  return (
    <main className={loginStyles.page}>
      <header className={loginStyles.newnavbar}>
        <div className={loginStyles.navInner}>
          <nav aria-label="Main navigation" className={loginStyles.navMenu}>
            {navItems.map((item) => (
              <Link key={item.label} className={loginStyles.navLink} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={loginStyles.brandBlock}>
            <span className={loginStyles.brandTitle}>الجمهورية العربية السورية</span>
            <span className={loginStyles.brandSubtitle}>
              ثانوية الحاسوب للبنين في سرمدا - محافظة إدلب
            </span>
          </div>

          <div className={loginStyles.actionSlot}>
            <Link className={loginStyles.loginLink} href="/login">
              <span aria-hidden="true" className={loginStyles.loginIcon} />
              تبديل الحساب
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroInner}>
          <div className={styles.dashboardLead}>
            <span className={styles.dashboardKicker}>Dashboard Memory</span>
            <h1 className={styles.dashboardTitle}>لوحة التحكم بنفس الهوية البصرية</h1>
            <p className={styles.dashboardDescription}>
              هذه الواجهة الآن مرتبطة بصريًا مع الصفحة الرئيسية وتسجيل الدخول والتسجيل:
              نفس الخلفية، نفس الشريط العلوي، ونفس منطق الكتل الكبيرة الواضحة.
            </p>

            <div className={styles.viewerBadge}>
              <span className={styles.viewerName}>{user.name}</span>
              <span className={styles.viewerRole}>{user.role}</span>
            </div>
          </div>

          <div className={styles.dashboardPanel}>
            <div className={styles.dashboardTabs}>
              {dashboardItems.map((item) => (
                <Link
                  key={item.href}
                  className={`${styles.dashboardTab} ${
                    isActivePath(currentPath, item.href) ? styles.dashboardTabActive : ""
                  }`}
                  href={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className={styles.dashboardContent}>{props.children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
