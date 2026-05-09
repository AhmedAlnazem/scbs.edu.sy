import Link from "next/link";

import styles from "./HeroSlider.module.css";

const cardStats = [
  { label: "الأقسام", value: "04" },
  { label: "الأدوار", value: "04" },
  { label: "مسارات النشر", value: "03" },
];

export default function HeroSlider(): React.JSX.Element {
  return (
    <section aria-label="بطاقة تعريف المنصة" className={styles.cardSection}>
      <div className={styles.cardShell}>
        <div className={styles.copyPanel}>
          <span className={styles.eyebrow}>نظرة على المنصة</span>
          <h2 className={styles.title}>لوحة واحدة تربط الطالب والمشرف والمحتوى العلمي</h2>
          <p className={styles.description}>
            هذا الجزء يوضح كيف تتحول الفكرة إلى نظام فعلي: لوحة طالب، مراجعة مدرس،
            أرشيف مكتبة، صفحات مشاريع، ومدخل مركزي لإدارة الملفات والكود.
          </p>

          <div className={styles.actions}>
            <Link className={styles.primaryAction} href="/dashboard">
              لوحة الطالب
            </Link>
            <Link className={styles.secondaryAction} href="/admin">
              لوحة الإدارة
            </Link>
          </div>
        </div>

        <div className={styles.visualCard}>
          <div className={styles.badgeRow}>
            <span className={styles.liveBadge}>System Preview</span>
            <span className={styles.liveNote}>Workflow + Content + Permissions</span>
          </div>

          <div className={styles.statsGrid}>
            {cardStats.map((item) => (
              <div key={item.label} className={styles.statCard}>
                <strong className={styles.statValue}>{item.value}</strong>
                <span className={styles.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>لوحة الطالب: ملف شخصي ومفضلة وإشعارات</div>
            <div className={styles.featureItem}>مراجعة المدرس: اعتماد وتعليقات وتحكم بالنشر</div>
            <div className={styles.featureItem}>موارد المكتبة والكود: PDF و ZIP وصور و GitHub و snippets</div>
          </div>
        </div>
      </div>
    </section>
  );
}
