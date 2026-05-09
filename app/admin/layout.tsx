import { Role } from "@/generated/prisma";

import { AppFrame, DashboardLinks } from "@/app/_components/content-ui";
import { requirePageRole, withOwnerAccess } from "@/app/_lib/session";

export default async function AdminLayout(props: LayoutProps<"/admin">) {
  const user = await requirePageRole(withOwnerAccess([Role.ADMIN]), "/admin");

  return (
    <AppFrame currentPath="/admin" viewer={user}>
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[30px] border border-[rgba(0,38,35,0.12)] bg-[linear-gradient(135deg,rgba(16,61,56,0.98),rgba(10,45,41,0.94))] p-5 text-white shadow-[0_20px_50px_rgba(0,38,35,0.18)] sm:p-6">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(163,71,45,0.18),transparent_20%)]" />

          <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/66">
                Admin Workspace
              </p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                إدارة المحتوى والمستخدمين من نقطة واحدة
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-white/74 sm:text-base">
                تنقل سريع بين نظرة النظام العامة، مراجعة المنشورات، وضبط صلاحيات المستخدمين
                دون فقدان السياق.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/78 backdrop-blur-sm">
              المستخدم الحالي: <span className="font-semibold text-white">{user.name}</span>
            </div>
          </div>
        </section>

        <div className="rounded-[28px] border border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))] p-4 shadow-[var(--shadow)] sm:p-5">
          <DashboardLinks
            basePath="/admin"
            items={[
              { href: "/admin", label: "نظرة عامة" },
              { href: "/admin/posts", label: "المنشورات" },
              { href: "/admin/users", label: "المستخدمون" },
            ]}
          />
        </div>

        {props.children}
      </div>
    </AppFrame>
  );
}
