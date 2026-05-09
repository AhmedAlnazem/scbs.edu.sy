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

const manageItems = [
  { href: "/manage/posts", label: "إدارة المنشورات" },
  { href: "/manage/posts/new", label: "منشور جديد" },
];

export default async function ManageLayout(props: LayoutProps<"/manage">) {
  const user = await requireUser("/manage");

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
            <Link className={loginStyles.loginLink} href="/dashboard">
              <span aria-hidden="true" className={loginStyles.loginIcon} />
              الرجوع إلى اللوحة
            </Link>
          </div>
        </div>
      </header>

      <section className={styles.dashboardHero}>
        <div className={styles.dashboardHeroInner}>
          <div className={styles.dashboardLead}>
            <span className={styles.dashboardKicker}>Manage Space</span>
            <h1 className={styles.dashboardTitle}>مساحة إدارة المحتوى</h1>
            <p className={styles.dashboardDescription}>
              هنا تتم إدارة المنشورات وإنشاؤها وتعديلها. أما صفحة <code>/posts</code> فهي
              مخصصة للعرض والتصفح فقط.
            </p>

            <div className={styles.viewerBadge}>
              <span className={styles.viewerName}>{user.name}</span>
              <span className={styles.viewerRole}>{user.role}</span>
            </div>
          </div>

          <div className={styles.dashboardPanel}>
            <div className={styles.dashboardTabs}>
              {manageItems.map((item) => (
                <Link key={item.href} className={styles.dashboardTab} href={item.href}>
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
