import type { Metadata } from "next";

import { PwaInstallButton } from "@/app/_components/pwa-install";
import { SiteFooter } from "@/app/_components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصه مدرسه الحاسوب للبنين في سرمدا",
  description: "منصة مدرسية للنشر والبحوث ومشاركة الأكواد",
  applicationName: "منصه مدرسه الحاسوب للبنين في سرمدا",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html dir="rtl" lang="ar" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <SiteFooter />
        <PwaInstallButton />
      </body>
    </html>
  );
}
