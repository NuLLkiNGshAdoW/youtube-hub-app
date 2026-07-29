"use client";

import { useState } from "react";
import { Flame, Gift, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BreathingCard } from "./BreathingCard";
import { claimDailyStreak, getStreakInfo } from "@/lib/api/features";
import type { User } from "@supabase/supabase-js";

interface DailyStreakSectionProps {
  user: User | null;
}

export function DailyStreakSection({ user }: DailyStreakSectionProps) {
  const [streak, setStreak] = useState<number>(0);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  async function loadStreak() {
    if (!user) {
      setLoaded(true);
      return;
    }
    const info = await getStreakInfo(user.id);
    if (info) {
      setStreak(info.current_streak);
      setClaimed(info.claimed_today);
    }
    setLoaded(true);
  }

  // Загружаем стрик при первом рендере, если пользователь авторизован
  if (user && !loaded) {
    loadStreak();
  }

  async function handleClaim() {
    if (!user || loading || claimed) return;
    setLoading(true);
    const result = await claimDailyStreak(user.id);
    if (result.success) {
      setStreak(result.newStreak);
      setClaimed(true);
    }
    setMessage(result.message);
    setLoading(false);
    setTimeout(() => setMessage(null), 4000);
  }

  const days = Array.from({ length: 7 }, (_, i) => i + 1);
  const todayReward = Math.min(streak + (claimed ? 0 : 1), 7) * 10;

  return (
    <BreathingCard>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-500" />
            Ежедневный стрик
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Заходи каждый день и получай бонусные XP
          </p>
        </div>
        {user && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Flame className="w-5 h-5 text-orange-500" />
            <span className="text-2xl font-black text-orange-400">{streak}</span>
            <span className="text-xs text-gray-400">дн. подряд</span>
          </div>
        )}
      </div>

      {/* Полоса дней */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {days.map((day) => {
          const isCompleted = day <= streak;
          const isToday = day === streak + (claimed ? 0 : 1) && !claimed && !!user;
          const isLocked = day > streak + 1;

          return (
            <div
              key={day}
              className={`relative flex flex-col items-center justify-center aspect-square rounded-xl border transition-all ${
                isCompleted
                  ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 border-orange-500/40"
                  : isToday
                    ? "bg-white/[0.03] border-orange-500/40 animate-pulse"
                    : "bg-white/[0.02] border-white/5 opacity-50"
              }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 text-orange-400 mb-0.5" />
              ) : (
                <span className="text-xs text-gray-600 mb-0.5">{day}</span>
              )}
              <span className={`text-[10px] font-mono font-bold ${isCompleted ? "text-orange-300" : "text-gray-600"}`}>
                +{day * 10}
              </span>
            </div>
          );
        })}
      </div>

      {/* Кнопка / призыв к действию */}
      {!user ? (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 text-center">
          <p className="text-sm text-gray-400">
            🔥 Войди в аккаунт, чтобы начать собирать стрик и получать ежедневные награды!
          </p>
        </div>
      ) : claimed ? (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 text-center">
          <p className="text-sm text-emerald-400 flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Награда за сегодня получена! Возвращайся завтра.
          </p>
        </div>
      ) : (
        <button
          onClick={handleClaim}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <span>Загрузка...</span>
          ) : (
            <>
              <Gift className="w-4 h-4" />
              Забрать награду — +{todayReward} XP
            </>
          )}
        </button>
      )}

      {/* Тостер-сообщение */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-3 rounded-xl border border-white/10 bg-white/[0.05] p-3 text-center text-sm text-white"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </BreathingCard>
  );
}
