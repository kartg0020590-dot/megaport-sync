import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_JP } from "next/font/google"; // 💡 1. 引入 Noto Sans JP
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// 💡 2. 設定 Noto Sans JP (大港風格核心：重量 900)
const notoJP = Noto_Sans_JP({ 
  variable: "--font-noto-jp", 
  subsets: ["latin"],
  weight: ["900"] // 鎖定最粗版本，模擬斑駁感效果最好
});

export const metadata: Metadata = {
  title: "MEGAPORT 2026 | 大港小隊同步工具",
  description: "與朋友同步你的 2026 大港開唱課表",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      {/* 💡 3. 將 notoJP.variable 加入 body 的 className 中 */}
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoJP.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}