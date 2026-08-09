// app/admin/layout.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Sliders,
  LayoutGrid,
  Calendar,
  Image as ImageIcon,
  Lock,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { href: "/admin/questions", label: "Вопросы (чат)", icon: MessageCircle },
  { href: "/admin/hotbar", label: "Хотбары / карточки", icon: LayoutGrid },
  { href: "/admin/events", label: "События", icon: Calendar },
  { href: "/admin/fan-arts", label: "Фан-арты", icon: ImageIcon },
  { href: "/admin/backstage", label: "За кулисами", icon: Lock },
  { href: "/admin/settings", label: "Настройки сайта", icon: Sliders },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-hidden text-white">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-[#090A0F]/90 backdrop-blur-xl px-4 py-3 sm:hidden">
        <div className="flex items-center gap-3">
          <Lock className="w-5 h-5 text-[#3B82F6]" />
          <span className="font-semibold text-white">Админ-панель</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
          aria-label="Toggle admin menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside
        className={`fixed inset-y-0 left-0 z-20 w-64 border-r border-white/10 bg-[#090A0F]/95 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.08)] transition-transform duration-300 sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } sm:relative sm:inset-auto sm:translate-x-0`}
      >
        <div className="flex items-center justify-between px-4 py-4 sm:hidden">
          <span className="font-semibold text-[#3B82F6]">Меню</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10"
            aria-label="Close admin menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-4 py-4 hidden sm:block">
          <h2 className="text-lg font-bold mb-6 text-[#3B82F6]">Админ-панель</h2>
        </div>
        <nav className="space-y-1 px-4 pb-6 sm:px-4 sm:pb-0">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-lg px-3 py-3 text-sm text-[#8B93A7] transition hover:bg-white/5 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="sm:ml-64 p-4 sm:p-8">
        <div className="sm:hidden h-16" />
        {children}
      </main>
    </div>
  );
}
