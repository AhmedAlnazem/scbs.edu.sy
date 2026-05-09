import type { Metadata } from "next";

import { PwaInstallButton } from "@/app/_components/pwa-install";
import { SiteFooter } from "@/app/_components/site-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "منصة المدرسة",
  description: "منصة مدرسية للنشر والبحوث ومشاركة الأكواد",
  applicationName: "منصة المدرسة",
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
