import { PostStatus, PostType, Role } from "@/generated/prisma";

export const roleLabels: Record<Role, string> = {
  OWNER: "المالك",
  STUDENT: "الطالب",
  TEACHER: "المعلم",
  ADMIN: "المدير",
};

export const postTypeLabels: Record<PostType, string> = {
  BLOG: "مدونة",
  RESEARCH: "بحث",
  CODE: "كود",
  PROJECT: "مشروع",
};

export const postStatusLabels: Record<PostStatus, string> = {
  DRAFT: "مسودة",
  PENDING: "قيد المراجعة",
  PUBLISHED: "منشور",
  REJECTED: "مرفوض",
};
