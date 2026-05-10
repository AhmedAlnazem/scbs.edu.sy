import Link from "next/link";

import { Role } from "@/generated/prisma";
import { AppFrame } from "@/app/_components/content-ui";
import { requirePageRole, withOwnerAccess } from "@/app/_lib/session";
import styles from "./admin.module.css";

const adminNavItems = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/posts", label: "المنشورات" },
  { href: "/admin/users", label: "المستخدمون" },
];

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const user = await requirePageRole(withOwnerAccess([Role.ADMIN]), "/admin");

  return (
    <AppFrame currentPath="/admin" viewer={user}>
      <div className={styles.shell}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <span className={styles.kicker}>Admin Workspace</span>
              <h1 className={styles.heroTitle}>إدارة المحتوى والمستخدمين بنفس روح الواجهة الرئيسية</h1>
              <p className={styles.heroDescription}>
                مساحة تشغيل هادئة وواضحة، بنفس ألوان المنصة وأنماطها، لكن موجهة للقرارات
                السريعة والمتابعة اليومية.
              </p>
            </div>

            <div className={styles.heroBadge}>
              المستخدم الحالي
              <strong>{user.name}</strong>
            </div>
          </div>
        </section>

        <nav className={styles.navPanel} aria-label="Admin navigation">
          {adminNavItems.map((item) => (
            <Link key={item.href} className={styles.navLink} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        {props.children}
      </div>
    </AppFrame>
  );
}
