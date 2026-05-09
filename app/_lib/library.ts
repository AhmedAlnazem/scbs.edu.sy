import { PostType } from "@/generated/prisma";

export const libraryGrades = [
  { slug: "first-secondary", label: "الأول الثانوي" },
  { slug: "second-secondary", label: "الثاني الثانوي" },
  { slug: "third-secondary", label: "الثالث الثانوي" },
] as const;

export const librarySections = [
  { slug: "posts", label: "المنشورات" },
  { slug: "codes", label: "الأكواد" },
  { slug: "research", label: "الأبحاث" },
  { slug: "projects", label: "المشاريع" },
] as const;

export type LibraryGradeSlug = (typeof libraryGrades)[number]["slug"];
export type LibrarySectionSlug = (typeof librarySections)[number]["slug"];

export function isLibraryGrade(value: string): value is LibraryGradeSlug {
  return libraryGrades.some((grade) => grade.slug === value);
}

export function isLibrarySection(value: string): value is LibrarySectionSlug {
  return librarySections.some((section) => section.slug === value);
}

export function getLibraryGradeLabel(value: string | null | undefined) {
  return libraryGrades.find((grade) => grade.slug === value)?.label ?? "غير محدد";
}

export function getLibrarySectionLabel(value: string) {
  return librarySections.find((section) => section.slug === value)?.label ?? value;
}

export function getLibrarySectionDescription(value: LibrarySectionSlug) {
  switch (value) {
    case "posts":
      return "جميع المنشورات المنشورة الخاصة بهذا الصف.";
    case "codes":
      return "الأكواد المنشورة المرتبطة بهذا الصف.";
    case "research":
      return "الأبحاث المنشورة المرتبطة بهذا الصف.";
    case "projects":
      return "المشاريع المنشورة المرتبطة بهذا الصف.";
  }
}

export function getPostTypeForLibrarySection(value: LibrarySectionSlug) {
  switch (value) {
    case "posts":
      return undefined;
    case "codes":
      return PostType.CODE;
    case "research":
      return PostType.RESEARCH;
    case "projects":
      return PostType.PROJECT;
  }
}
