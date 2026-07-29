"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Главная", href: "/" },
  { label: "Фан-арт", href: "/gallery" },
  { label: "Интервью с автором", href: "/ama" }, // <-- Новое название
  { label: "События", href: "/events" },
  { label: "За кулисами", href: "/backstage" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#0B0D12]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        {/* Логотип */}
        <Link href="/" className="font-bold text-xl text-white tracking-wider">
          Null<span className="text-[#7C5CFF]">KinG</span>
        </Link>

        {/* Навигационные ссылки */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-1.5 text-xs sm:text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#7C5CFF] text-white shadow-lg shadow-[#7C5CFF]/20"
                    : "text-[#8B93A7] hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}