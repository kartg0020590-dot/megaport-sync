import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MEGAPORT 2026 | 大港小隊同步工具",
  description: "與朋友同步你的 2026 大港開唱課表",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // 💡 加入 suppressHydrationWarning 解決截圖中的紅字錯誤
    <html lang="zh-TW" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}