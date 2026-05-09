import { PostType } from "@/generated/prisma";

import { createContentAction } from "@/app/_actions/content";
import { PageIntro, PostFormFields, Surface } from "@/app/_components/content-ui";
import { SubmitButton } from "@/app/_components/submit-button";
import { listCategories } from "@/app/_lib/posts";
import { requireUser } from "@/app/_lib/session";

export default async function DashboardNewPostPage() {
  await requireUser("/manage/posts/new");
  const categories = await listCategories();

  return (
    <Surface>
      <PageIntro
        eyebrow="منشور جديد"
        title="إنشاء منشور جديد"
        description="هذه الصفحة جزء من مساحة الإدارة. بعد الحفظ يمكنك عرض المنشور من صفحات العرض العامة."
      />

      <form action={createContentAction} className="mt-8 space-y-5">
        <PostFormFields
          categories={categories}
          initialValues={{ classLevel: "first-secondary", type: PostType.BLOG }}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
            name="submitMode"
            type="submit"
            value="DRAFT"
          >
            حفظ كمسودة
          </button>
          <SubmitButton
            className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
            idleLabel="إرسال للمراجعة"
            pendingLabel="جار الإرسال..."
            name="submitMode"
            value="PENDING"
          />
        </div>
      </form>
    </Surface>
  );
}
