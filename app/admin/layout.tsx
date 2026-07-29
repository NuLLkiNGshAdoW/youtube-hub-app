// app/admin/layout.tsx
import Link from "next/link";
import {
  MessageCircle,
  Sliders,
  LayoutGrid,
  Calendar,
  Image as ImageIcon,
  Lock,
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
  return (
    <div className="min-h-screen bg-[#0B0D12] text-white flex">
      <aside className="w-64 border-r border-white/10 p-4 fixed h-screen">
        <h2 className="text-lg font-bold mb-6 text-[#3B82F6]">Админ-панель</h2>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#8B93A7] hover:bg-white/5 hover:text-white transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 ml-64 p-8">{children}</main>
    </div>
  );
}