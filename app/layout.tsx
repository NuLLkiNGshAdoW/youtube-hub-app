import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ParallaxBackground } from "@/components/hub";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"], // Добавили кириллицу для корректного отображения шрифтов
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "NullKinG — Официальный сайт канала",
  description: "Сообщество NullKinG: Фан-арты, вопросы и ответы (AMA), анонсы и за кулисами.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col relative">
        <ParallaxBackground />
        <div className="relative z-10 min-h-full flex flex-col">{children}</div>
      </body>
    </html>
  );
}
