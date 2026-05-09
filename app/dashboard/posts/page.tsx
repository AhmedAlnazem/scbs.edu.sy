import Link from "next/link";

import { EmptyState, PageIntro, PostCard, Surface } from "@/app/_components/content-ui";
import { listPostsByAuthor } from "@/app/_lib/posts";
import { requireUser } from "@/app/_lib/session";

export default async function DashboardPostsPage() {
  const user = await requireUser("/manage/posts");
  const posts = await listPostsByAuthor(user.id);

  const surfaceClass =
    "border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))] text-[var(--foreground)]";
  const cardClass =
    "border-[var(--line)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98),rgba(244,236,223,0.95))]";
  return (
    <Surface className={surfaceClass}>
      <div>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <PageIntro
            eyebrow="إدارة المنشورات"
            title="إدارة المنشورات"
            description="هذه الصفحة مخصصة للإدارة فقط. أما /posts فهي مخصصة لعرض المحتوى."
          />

          <Link
            className="themeButton rounded-2xl px-4 py-3 text-sm font-medium"
            href="/manage/posts/new"
          >
            منشور جديد
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {posts.length === 0 ? (
            <EmptyState
              title="القائمة فارغة"
              description="عند إنشاء أول منشور داخل مساحة الإدارة سيظهر هنا."
            />
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                className={cardClass}
                href={`/manage/posts/${post.id}/edit`}
                post={post}
                showStatus
              />
            ))
          )}
        </div>
      </div>
    </Surface>
  );
}
