"use client";

/**
 * app/page.tsx — Главная страница YouTube-хаба.
 *
 * Дизайн-токены (вынести в tailwind.config.ts):
 *   bg           #0B0D12   — фон (глубокий "космос")
 *   surface      #14171F   — карточки
 *   surface-2    #1B1F2B   — приподнятые панели (player card)
 *   violet       #7C5CFF   — прогресс/XP
 *   gold         #FFB020   — ачивки/трофеи
 *   live         #FF4D5E   — live/countdown
 *   text         #E7E9EE
 *   muted        #8B93A7
 *
 * Шрифты (подключить через next/font в app/layout.tsx):
 *   Display : Space Grotesk  — заголовки, HUD-цифры
 *   Body    : Inter          — основной текст
 *   Mono    : JetBrains Mono — XP/очки/таймер/теги
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signInWithProvider } from "@/lib/supabase/auth";
import {
  Play,
  Trophy,
  Sparkles,
  Users,
  Image as ImageIcon,
  MessageCircleQuestion,
  Compass,
  Gift,
  Lock,
  Radio,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------
// Демо-данные (в реальном проекте — из Supabase)
// ---------------------------------------------------------------
const player = {
  name: "Ты, зритель канала",
  level: 7,
  xp: 2140,
  xpToNext: 2500,
  badges: [
    { icon: "🌙", label: "Ночная сова" },
    { icon: "🔥", label: "Стрик 30 дней" },
    { icon: "🎨", label: "Первый фан-арт" },
    { icon: "❓", label: "Задал вопрос" },
  ],
};

const nextStream = new Date(Date.now() + 1000 * 60 * 60 * 27); // demo: через 27ч

const features = [
  {
    icon: Trophy,
    tone: "gold" as const,
    title: "Очки и ачивки",
    desc: "Получай XP за вход, комментарии и опросы. Открывай бейджи и секретные пасхалки.",
  },
  {
    icon: ImageIcon,
    tone: "violet" as const,
    title: "Фан-арт галерея",
    desc: "Загружай свои работы, голосуй за чужие, попадай в топ недели.",
  },
  {
    icon: MessageCircleQuestion,
    tone: "violet" as const,
    title: "AMA — спроси автора",
    desc: "Отправляй вопросы, топовые попадают в следующий ролик.",
  },
  {
    icon: Compass,
    tone: "gold" as const,
    title: "Каталог проектов",
    desc: "Все видео и проекты с тегами и фильтрами — находи нужное за секунды.",
  },
  {
    icon: Radio,
    tone: "live" as const,
    title: "События и стримы",
    desc: "Календарь релизов и обратный отсчёт до следующего эфира.",
  },
  {
    icon: Lock,
    tone: "violet" as const,
    title: "За кулисами",
    desc: "Бэкстейдж-материалы и ранний доступ — по уровню подписки.",
  },
];

const toneMap = {
  gold: { text: "text-[#FFB020]", bg: "bg-[#FFB020]/10", ring: "ring-[#FFB020]/30" },
  violet: { text: "text-[#7C5CFF]", bg: "bg-[#7C5CFF]/10", ring: "ring-[#7C5CFF]/30" },
  live: { text: "text-[#FF4D5E]", bg: "bg-[#FF4D5E]/10", ring: "ring-[#FF4D5E]/30" },
};

function useCountdown(target: Date) {
  const [left, setLeft] = useState(() => Math.max(0, target.getTime() - Date.now()));
  useEffect(() => {
    const id = setInterval(() => setLeft(Math.max(0, target.getTime() - Date.now())), 1000);
    return () => clearInterval(id);
  }, [target]);
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return { h, m, s };
}

export default function HomePage() {
  const { h, m, s } = useCountdown(nextStream);
  const xpPct = Math.min(100, Math.round((player.xp / player.xpToNext) * 100));

  return (
    <main className="min-h-screen bg-[#0B0D12] text-[#E7E9EE] font-[Inter,sans-serif] selection:bg-[#7C5CFF]/40">
      {/* ---------------- HEADER ---------------- */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0B0D12]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="#" className="flex items-center gap-2 font-[Space_Grotesk,sans-serif] text-lg font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C5CFF]">
              <Play className="h-4 w-4 fill-white text-white" />
            </span>
            КаналХаб
          </a>
          <nav className="hidden items-center gap-6 text-sm text-[#8B93A7] md:flex">
            <a href="#gallery" className="hover:text-[#E7E9EE] transition-colors">Фан-арт</a>
            <a href="#ama" className="hover:text-[#E7E9EE] transition-colors">AMA</a>
            <a href="#events" className="hover:text-[#E7E9EE] transition-colors">События</a>
            <a href="#backstage" className="hover:text-[#E7E9EE] transition-colors">За кулисами</a>
          </nav>
          <button
           onClick={() => signInWithProvider("google")}
            className="rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium ring-1 ring-white/10 transition-colors hover:bg-white/[0.1]"
            >
                Войти
          </button>
        </div>
      </header>

      {/* ---------------- HERO: PLAYER CARD + COUNTDOWN ---------------- */}
      <section className="mx-auto max-w-6xl px-5 pt-14 pb-10">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          {/* Player card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#14171F] p-7"
          >
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[#7C5CFF]/10 blur-3xl" />
            <p className="font-mono text-xs uppercase tracking-widest text-[#8B93A7]">
              Профиль зрителя · Уровень {player.level}
            </p>
            <h1 className="mt-3 font-[Space_Grotesk,sans-serif] text-3xl font-bold leading-tight sm:text-4xl">
              Смотри. Участвуй.<br />Прокачивай уровень.
            </h1>
            <p className="mt-3 max-w-md text-sm text-[#8B93A7]">
              Каждое действие на сайте — комментарий, голос в опросе, ежедневный вход —
              приносит очки активности и открывает новые ачивки.
            </p>

            {/* XP bar */}
            <div className="mt-6">
              <div className="flex items-center justify-between font-mono text-xs text-[#8B93A7]">
                <span>XP {player.xp} / {player.xpToNext}</span>
                <span className="text-[#7C5CFF]">{xpPct}%</span>
              </div>
              <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-[#B39DFF]"
                />
              </div>
            </div>

            {/* Badge row */}
            <div className="mt-6 flex flex-wrap gap-2">
              {player.badges.map((b, i) => (
                <motion.div
                  key={b.label}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 300, damping: 18 }}
                  className="flex items-center gap-1.5 rounded-full bg-[#FFB020]/10 px-3 py-1.5 text-xs ring-1 ring-[#FFB020]/25"
                  title={b.label}
                >
                  <span>{b.icon}</span>
                  <span className="text-[#FFB020]">{b.label}</span>
                </motion.div>
              ))}
              <a
                href="#achievements"
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs text-[#8B93A7] transition-colors hover:text-[#E7E9EE]"
              >
                Все ачивки <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          </motion.div>

          {/* Countdown card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="flex flex-col justify-between rounded-2xl border border-[#FF4D5E]/20 bg-[#14171F] p-7"
          >
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF4D5E]/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF4D5E]" />
              </span>
              <p className="font-mono text-xs uppercase tracking-widest text-[#FF4D5E]">
                Следующий эфир
              </p>
            </div>

            <div className="my-6 flex items-baseline justify-center gap-2 font-[Space_Grotesk,sans-serif]">
              {[[h, "ч"], [m, "м"], [s, "с"]].map(([val, unit], i) => (
                <div key={i} className="flex flex-col items-center">
                  <span className="text-4xl font-bold tabular-nums sm:text-5xl">
                    {String(val).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-[#8B93A7]">{unit}</span>
                </div>
              ))}
            </div>

            <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF4D5E] py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">
              <Sparkles className="h-4 w-4" /> Напомнить мне
            </button>
          </motion.div>
        </div>
      </section>

      {/* ---------------- FEATURE CARDS ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-[#8B93A7]">
              Возможности сайта
            </p>
            <h2 className="mt-2 font-[Space_Grotesk,sans-serif] text-2xl font-bold sm:text-3xl">
              Всё комьюнити — в одном месте
            </h2>
          </div>
          <Users className="hidden h-8 w-8 text-[#8B93A7] sm:block" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => {
            const tone = toneMap[f.tone];
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl border border-white/[0.06] bg-[#14171F] p-6 transition-colors hover:border-white/[0.14]"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${tone.bg} ring-1 ${tone.ring}`}>
                  <Icon className={`h-5 w-5 ${tone.text}`} />
                </div>
                <h3 className="font-[Space_Grotesk,sans-serif] text-base font-semibold">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#8B93A7]">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ---------------- MERCH / DONATE STRIP ---------------- */}
      <section className="mx-auto max-w-6xl px-5 py-10">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-r from-[#14171F] to-[#1B1F2B] p-8 text-center sm:flex-row sm:text-left">
          <div>
            <h3 className="font-[Space_Grotesk,sans-serif] text-xl font-bold">
              Поддержи канал
            </h3>
            <p className="mt-1 text-sm text-[#8B93A7]">
              Мерч, донаты и бонусы для патронов — помогает делать больше контента.
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-lg bg-white/[0.06] px-5 py-2.5 text-sm font-medium ring-1 ring-white/10 hover:bg-white/[0.1]">
              <Gift className="h-4 w-4" /> Мерч
            </button>
            <button className="rounded-lg bg-[#7C5CFF] px-5 py-2.5 text-sm font-semibold hover:bg-[#8C6FFF]">
              Задонатить
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.06] py-8 text-center text-xs text-[#8B93A7]">
        © {new Date().getFullYear()} КаналХаб · сделано для комьюнити
      </footer>
    </main>
  );
}