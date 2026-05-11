import { notFound } from "next/navigation";

import { PostStatus } from "@/generated/prisma";
import { updateContentAction } from "@/app/_actions/content";
import { EmptyState, PageIntro, PostFormFields, Surface, tagNames } from "@/app/_components/content-ui";
import { joinMediaUrls, readMediaUrls } from "@/app/_lib/post-media";
import { SubmitButton } from "@/app/_components/submit-button";
import { isLibraryGrade } from "@/app/_lib/library";
import { getPostById, listCategories } from "@/app/_lib/posts";
import { requireUser } from "@/app/_lib/session";

export default async function DashboardEditPostPage(props: PageProps<"/dashboard/posts/[id]/edit">) {
  const { id } = await props.params;
  const user = await requireUser(`/manage/posts/${id}/edit`);
  const [post, categories] = await Promise.all([getPostById(id), listCategories()]);

  if (!post || post.authorId !== user.id) {
    notFound();
  }

  if (post.status === PostStatus.PUBLISHED) {
    return (
      <Surface>
        <EmptyState
          title="المنشور المنشور مقفل"
          description="العناصر المنشورة لا يمكن تعديلها مباشرة من مساحة الإدارة الخاصة بالطالب."
        />
      </Surface>
    );
  }

  const action = updateContentAction.bind(null, post.id);

  return (
    <Surface>
      <PageIntro
        eyebrow="تعديل المنشور"
        title={post.title}
        description="يمكنك تحديث البيانات ثم حفظها كمسودة أو إعادة إرسالها إلى المراجعة."
      />

      <form action={action} className="mt-8 space-y-5" encType="multipart/form-data">
        <PostFormFields
          categories={categories}
          initialValues={{
            title: post.title,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            imageUrls: joinMediaUrls(readMediaUrls(post.imageUrls)),
            videoUrls: joinMediaUrls(readMediaUrls(post.videoUrls)),
            fileUrls: joinMediaUrls(readMediaUrls(post.fileUrls)),
            classLevel: isLibraryGrade(post.classLevel) ? post.classLevel : "first-secondary",
            categoryId: post.categoryId,
            tags: tagNames(post),
            type: post.type,
          }}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
            name="submitMode"
            type="submit"
            value="DRAFT"
          >
            تحديث كمسودة
          </button>
          <SubmitButton
            className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
            idleLabel="إعادة الإرسال للمراجعة"
            pendingLabel="جار التحديث..."
            name="submitMode"
            value="PENDING"
          />
        </div>
      </form>
    </Surface>
  );
}
