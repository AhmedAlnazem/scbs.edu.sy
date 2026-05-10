import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصه مدرسه الحاسوب للبنين في سرمدا",
    short_name: "مدرسه الحاسوب",
    description: "منصة مدرسية للنشر والبحوث ومشاركة الأكواد",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f4efe7",
    theme_color: "#094239",
    lang: "ar",
    dir: "rtl",
    icons: [
      {
        src: "/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
