import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "梗词判定机 | MemeAI",
  description: "使用 Next.js + DeepSeek 的中文梗词判定器",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700;900&display=swap"
          rel="stylesheet"
        />
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="bg-gray-50 text-slate-900 antialiased font-sans">{children}</body>
    </html>
  );
}
