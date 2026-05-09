import Link from "next/link";

import { logoutAction } from "@/app/_actions/auth";
import { roleName } from "@/app/_components/content-ui";
import type { User } from "@/generated/prisma";
import styles from "@/app/page.module.css";

type Viewer = Pick<User, "name" | "role"> | null;

export function HomeAccountMenu({ user }: { user: Viewer }) {
  if (!user) {
    return (
      <Link className={styles.loginLink} href="/login">
        <span aria-hidden="true" className={styles.loginIcon} />
        تسجيل الدخول إلى المنصة
      </Link>
    );
  }

  return (
    <details className={styles.accountMenu}>
      <summary className={styles.loginLink}>
        <span aria-hidden="true" className={styles.loginIcon} />
        <span className={styles.accountSummaryText}>
          <span className={styles.accountName}>{user.name}</span>
          <span className={styles.accountRole}>{roleName(user.role)}</span>
        </span>
        <span aria-hidden="true" className={styles.accountChevron}>
          ▾
        </span>
      </summary>

      <div className={styles.accountDropdown}>
        <Link className={styles.accountItem} href="/dashboard">
          الملف الشخصي
        </Link>
        <Link className={styles.accountItem} href="/manage/posts">
          الإدارة
        </Link>
        {user.role === "ADMIN" || user.role === "OWNER" ? (
          <Link className={styles.accountItem} href="/admin">
            إدارة النظام
          </Link>
        ) : null}
        <form action={logoutAction}>
          <button className={styles.accountItemButton} type="submit">
            تسجيل الخروج
          </button>
        </form>
      </div>
    </details>
  );
}
