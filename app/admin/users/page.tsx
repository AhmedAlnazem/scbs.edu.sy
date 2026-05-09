import { Role } from "@/generated/prisma";

import { createAdminUserAction, updateUserRoleAction } from "@/app/_actions/content";
import { EmptyState, PageIntro, Surface } from "@/app/_components/content-ui";
import { SubmitButton } from "@/app/_components/submit-button";
import { roleLabels } from "@/app/_lib/labels";
import { listUsersWithPostCounts } from "@/app/_lib/posts";
import { requirePageRole, withOwnerAccess } from "@/app/_lib/session";

const studentClassOptions = ["الأول الثانوي", "الثاني ثانوي", "الثالث الثانوي"] as const;

export default async function AdminUsersPage() {
  await requirePageRole(withOwnerAccess([Role.ADMIN]), "/admin/users");
  const users = await listUsersWithPostCounts();

  const protectedUsers = users.filter((user) => user.isProtected).length;
  const contributors = users.filter((user) => user._count.posts > 0).length;
  const admins = users.filter((user) => user.role === Role.ADMIN || user.role === Role.OWNER).length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[32px] border border-[rgba(0,38,35,0.14)] bg-[linear-gradient(135deg,#103d38_0%,#0b322d_58%,#0a2925_100%)] p-6 shadow-[0_24px_70px_rgba(0,38,35,0.16)] sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(163,71,45,0.16),transparent_24%)]" />

        <div className="relative grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-5 text-white">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                إدارة المستخدمين
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                ضبط الأدوار بدون تشويش
              </h2>
              <p className="max-w-3xl text-sm leading-7 text-white/78 sm:text-base">
                هذه الشاشة مخصصة للتحكم في الصلاحيات ومراقبة النشاط، مع حماية واضحة للحسابات
                الحساسة داخل المنصة.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">كل الحسابات</p>
                <p className="mt-2 text-3xl font-semibold">{users.length}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">مستخدمون نشطون</p>
                <p className="mt-2 text-3xl font-semibold">{contributors}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-white/70">إدارة عليا</p>
                <p className="mt-2 text-3xl font-semibold">{admins}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 self-start">
            <div className="rounded-[28px] border border-[rgba(0,38,35,0.08)] bg-[rgba(255,250,242,0.96)] p-5 text-[var(--foreground)] shadow-[0_18px_36px_rgba(0,38,35,0.08)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                ضوابط
              </p>
              <p className="mt-3 text-lg font-semibold">
                الحسابات المحمية لا تُعدّل هنا، وبقية الأدوار يجب أن تبقى متسقة مع مسؤولية كل مستخدم.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--muted)]">
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">
                  {protectedUsers} حساب محمي
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white px-3 py-1">
                  {contributors} يساهم بالمحتوى
                </span>
              </div>
            </div>

            <form
              action={createAdminUserAction}
              className="rounded-[28px] border border-[rgba(0,38,35,0.08)] bg-[rgba(255,250,242,0.96)] p-5 text-[var(--foreground)] shadow-[0_18px_36px_rgba(0,38,35,0.08)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--accent)]">
                إضافة مستخدم
              </p>
              <div className="mt-4 grid gap-3">
                <input
                  className="themeInput rounded-2xl px-4 py-3 text-sm outline-none"
                  name="name"
                  placeholder="الاسم الكامل"
                  required
                  type="text"
                />
                <input
                  className="themeInput rounded-2xl px-4 py-3 text-sm outline-none"
                  name="email"
                  placeholder="البريد الإلكتروني"
                  required
                  type="email"
                />
                <input
                  className="themeInput rounded-2xl px-4 py-3 text-sm outline-none"
                  name="password"
                  placeholder="كلمة المرور"
                  required
                  type="password"
                />
                <select
                  className="themeInput rounded-2xl px-4 py-3 text-sm outline-none"
                  defaultValue={Role.STUDENT}
                  name="role"
                >
                  {[Role.STUDENT, Role.TEACHER, Role.ADMIN].map((role) => (
                    <option key={role} value={role}>
                      {roleLabels[role]}
                    </option>
                  ))}
                </select>
                <select
                  className="themeInput rounded-2xl px-4 py-3 text-sm outline-none"
                  defaultValue=""
                  name="studentClass"
                >
                  <option value="">بدون صف أو اختر صف الطالب</option>
                  {studentClassOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <SubmitButton
                  className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
                  idleLabel="إنشاء المستخدم"
                  pendingLabel="جارٍ الإنشاء..."
                />
              </div>
            </form>
          </div>
        </div>
      </section>

      <Surface className="bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageIntro
            eyebrow="Roles"
            title="بطاقات الحسابات"
            description="كل مستخدم يظهر في بطاقة مستقلة لتبقى تغييرات الدور واضحة ولا تختلط بين الحسابات."
          />
          <div className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-[var(--muted)]">
            الترتيب حسب الدور ثم الاسم
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {users.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState title="لا يوجد مستخدمون" description="تحقق من تهيئة قاعدة البيانات والبذور." />
            </div>
          ) : (
            users.map((user) => (
              <form
                key={user.id}
                action={updateUserRoleAction}
                className="rounded-[28px] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[0_14px_32px_rgba(0,38,35,0.05)]"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[rgba(163,71,45,0.16)] bg-[rgba(163,71,45,0.08)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                        {roleLabels[user.role]}
                      </span>
                      {user.isProtected ? (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          Protected owner
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-[var(--foreground)]">{user.name}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">@{user.username}</p>
                      <p className="mt-1 text-sm text-[var(--muted)]">{user.email}</p>
                    </div>
                  </div>

                  <div className="rounded-[20px] border border-[var(--line)] bg-white/80 px-4 py-3 text-sm text-[var(--muted)]">
                    {user._count.posts} منشور
                  </div>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input name="userId" type="hidden" value={user.id} />
                  <select
                    className="themeInput min-w-[180px] rounded-2xl px-4 py-3 text-sm outline-none"
                    defaultValue={user.role}
                    disabled={user.isProtected}
                    name="role"
                  >
                    {Object.values(Role)
                      .filter((role) => role !== Role.OWNER || user.role === Role.OWNER)
                      .map((role) => (
                        <option key={role} value={role}>
                          {roleLabels[role]}
                        </option>
                      ))}
                  </select>

                  {user.isProtected ? (
                    <span className="rounded-2xl border border-[var(--line)] bg-white px-4 py-3 text-sm font-medium text-[var(--muted)]">
                      هذا الحساب غير قابل للتعديل
                    </span>
                  ) : (
                    <SubmitButton
                      className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
                      idleLabel="تحديث الدور"
                      pendingLabel="جارٍ الحفظ..."
                    />
                  )}
                </div>
              </form>
            ))
          )}
        </div>
      </Surface>
    </div>
  );
}
