import Link from "next/link";

const primaryLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/library", label: "المكتبة" },
  { href: "/posts", label: "المنشورات" },
  { href: "/research", label: "الأبحاث" },
];

const utilityLinks = [
  { href: "/login", label: "تسجيل الدخول" },
  { href: "/register", label: "حساب جديد" },
  { href: "/dashboard", label: "لوحة التحكم" },
];

const footerStats = [
  { value: "04", label: "أقسام رئيسية" },
  { value: "03", label: "مسارات نشر" },
  { value: "01", label: "منصة موحدة" },
];

export function SiteFooter() {
  return (
    <footer className="siteFooter">
      <div className="siteFooterInner">
        <div className="siteFooterGrid">
          <section className="siteFooterBrand">
            <span className="siteFooterKicker">Digital School Platform</span>
            <h2 className="siteFooterTitle">
              الجمهورية العربية السورية
              <br />
              ثانوية الحاسوب للبنين في سرمدا - محافظة إدلب
            </h2>
            <p className="siteFooterText">
              مساحة حديثة تجمع بوابة الطلاب والمشرفين والمكتبة والأكواد داخل تجربة واحدة مترابطة
              بصريًا ووظيفيًا.
            </p>

            <div className="siteFooterStats">
              {footerStats.map((stat) => (
                <div key={stat.label} className="siteFooterStat">
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="siteFooterColumn">
            <h3 className="siteFooterColumnTitle">التنقل</h3>
            <nav aria-label="Footer primary navigation" className="siteFooterLinks">
              {primaryLinks.map((link) => (
                <Link key={link.href} className="siteFooterLink" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section className="siteFooterColumn">
            <h3 className="siteFooterColumnTitle">الوصول السريع</h3>
            <nav aria-label="Footer utility navigation" className="siteFooterLinks">
              {utilityLinks.map((link) => (
                <Link key={link.href} className="siteFooterLink" href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>
        </div>

        <div className="siteFooterBottom">
          <div className="siteFooterMeta">
            <span>الجمهورية العربية السورية</span>
            <span>محافظة إدلب</span>
            <span>ثانوية الحاسوب للبنين في سرمدا</span>
          </div>

          <div className="siteFooterCopyright">
            <span>© 2026</span>
            <span>Ahmed Alnazem</span>
            <span>احمد الناظم</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
