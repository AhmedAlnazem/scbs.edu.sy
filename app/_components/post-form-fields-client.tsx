"use client";

import { useState } from "react";

import { libraryGrades, type LibraryGradeSlug } from "@/app/_lib/library";
import { postTypeLabels } from "@/app/_lib/labels";
import type { PostType } from "@/generated/prisma";

type PostFormFieldsClientProps = {
  categories: { id: string; name: string }[];
  initialValues?: {
    title?: string;
    excerpt?: string | null;
    content?: string;
    coverImage?: string | null;
    imageUrls?: string;
    videoUrls?: string;
    fileUrls?: string;
    classLevel?: LibraryGradeSlug;
    categoryId?: string | null;
    tags?: string;
    type?: PostType;
  };
};

function splitLines(value?: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PostFormFieldsClient({
  categories,
  initialValues,
}: PostFormFieldsClientProps) {
  const [selectedType, setSelectedType] = useState<PostType>(initialValues?.type ?? "BLOG");
  const isCodeType = selectedType === "CODE";
  const existingImageUrls = splitLines(initialValues?.imageUrls);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-[var(--foreground)]">
          <span className="font-medium">نوع المنشور</span>
          <select
            className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
            defaultValue={initialValues?.type}
            name="type"
            onChange={(event) => setSelectedType(event.target.value as PostType)}
          >
            {(["BLOG", "RESEARCH", "CODE", "PROJECT"] as PostType[]).map((type) => (
              <option key={type} value={type}>
                {postTypeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm text-[var(--foreground)]">
          <span className="font-medium">الصف الدراسي</span>
          <select
            className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
            defaultValue={initialValues?.classLevel ?? "first-secondary"}
            name="classLevel"
          >
            {libraryGrades.map((grade) => (
              <option key={grade.slug} value={grade.slug}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2 text-sm text-[var(--foreground)]">
          <span className="font-medium">العنوان</span>
          <input
            className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
            defaultValue={initialValues?.title}
            name="title"
            required
            type="text"
          />
        </label>

        <label className="space-y-2 text-sm text-[var(--foreground)]">
          <span className="font-medium">التصنيف</span>
          <select
            className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
            defaultValue={initialValues?.categoryId ?? ""}
            name="categoryId"
          >
            <option value="">بدون تصنيف</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-4 sm:p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--foreground)]">رفع الصور</p>
          <p className="text-xs leading-6 text-[var(--muted)]">
            يتم رفع الصور مباشرة وحفظها داخل النظام. الحد الأقصى للصورة الواحدة 2 MB.
          </p>
        </div>

        <div className="mt-4 grid gap-4">
          <input name="existingCoverImage" type="hidden" value={initialValues?.coverImage ?? ""} />
          <input name="existingImageUrls" type="hidden" value={initialValues?.imageUrls ?? ""} />

          <label className="space-y-2 text-sm text-[var(--foreground)]">
            <span className="font-medium">صورة الغلاف</span>
            <input
              accept="image/*"
              className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
              name="coverImageFile"
              type="file"
            />
          </label>

          {initialValues?.coverImage ? (
            <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4">
              <p className="text-xs text-[var(--muted)]">صورة الغلاف الحالية</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Current cover"
                className="max-h-48 rounded-2xl object-cover"
                src={initialValues.coverImage}
              />
              <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <input name="removeCoverImage" type="checkbox" value="1" />
                <span>حذف صورة الغلاف الحالية</span>
              </label>
            </div>
          ) : null}

          <label className="space-y-2 text-sm text-[var(--foreground)]">
            <span className="font-medium">صور إضافية</span>
            <input
              accept="image/*"
              className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
              multiple
              name="imageFiles"
              type="file"
            />
          </label>

          {existingImageUrls.length > 0 ? (
            <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs text-[var(--muted)]">الصور الحالية</p>
                <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                  <input name="removeExistingImages" type="checkbox" value="1" />
                  <span>حذف الصور الحالية</span>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {existingImageUrls.map((url) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={url} alt="Current gallery" className="rounded-2xl object-cover" src={url} />
                ))}
              </div>
              <p className="text-xs text-[var(--muted)]">
                إذا رفعت صورًا جديدة بدون تحديد الحذف، فسيتم إضافتها إلى الصور الحالية.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <div className="rounded-[24px] border border-[var(--line)] bg-[var(--surface-strong)] p-4 sm:p-5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-[var(--foreground)]">الوسائط والروابط الأخرى</p>
          <p className="text-xs leading-6 text-[var(--muted)]">
            روابط الفيديو والملفات تبقى كرابط مباشر في الوقت الحالي.
          </p>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="space-y-2 text-sm text-[var(--foreground)]">
            <span className="font-medium">روابط الفيديو</span>
            <textarea
              className="themeInput min-h-24 w-full rounded-2xl px-4 py-3 outline-none"
              defaultValue={initialValues?.videoUrls ?? ""}
              name="videoUrls"
              placeholder={"https://example.com/video.mp4\nhttps://youtube.com/watch?v=..."}
              spellCheck={false}
            />
          </label>

          <label className="space-y-2 text-sm text-[var(--foreground)]">
            <span className="font-medium">روابط الملفات</span>
            <textarea
              className="themeInput min-h-24 w-full rounded-2xl px-4 py-3 outline-none"
              defaultValue={initialValues?.fileUrls ?? ""}
              name="fileUrls"
              placeholder={"https://example.com/file.pdf\nhttps://example.com/archive.zip"}
              spellCheck={false}
            />
          </label>
        </div>
      </div>

      <label className="space-y-2 text-sm text-[var(--foreground)]">
        <span className="font-medium">الوسوم</span>
        <input
          className="themeInput w-full rounded-2xl px-4 py-3 outline-none"
          defaultValue={initialValues?.tags ?? ""}
          name="tags"
          placeholder="بايثون، بيانات، أتمتة"
          type="text"
        />
      </label>

      <label className="block space-y-2 text-sm text-[var(--foreground)]">
        <span className="font-medium">{isCodeType ? "شرح الكود" : "الملخص"}</span>
        <textarea
          className="themeInput min-h-24 w-full rounded-2xl px-4 py-3 outline-none"
          defaultValue={initialValues?.excerpt ?? ""}
          name="excerpt"
          placeholder={
            isCodeType ? "اشرح وظيفة الكود وما الذي يفعله وأين يمكن استخدامه." : undefined
          }
        />
      </label>

      <label className="block space-y-2 text-sm text-[var(--foreground)]">
        <span className="font-medium">{isCodeType ? "الكود البرمجي" : "المحتوى"}</span>
        {isCodeType ? (
          <p className="text-xs leading-6 text-[var(--muted)]">
            عند اختيار نوع <strong>كود</strong> استخدم هذا الحقل للصق الكود مباشرة.
          </p>
        ) : null}
        <textarea
          className={`themeInput w-full rounded-2xl px-4 py-3 outline-none ${isCodeType ? "min-h-80 font-mono text-sm" : "min-h-56 font-mono text-sm"}`}
          defaultValue={initialValues?.content}
          name="content"
          placeholder={isCodeType ? "function example() {\n  console.log('Hello world');\n}" : undefined}
          required
          spellCheck={isCodeType ? false : undefined}
        />
      </label>
    </div>
  );
}
