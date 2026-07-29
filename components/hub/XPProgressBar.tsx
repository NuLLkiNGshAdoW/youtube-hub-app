"use client";

import { motion } from "framer-motion";
import type { UserProfile } from "@/types/hub";

// ---------------------------------------------------------------------------
// XP-прогресс-бар до следующего уровня.
// Формула: xpForNextLevel = level * 100 — подгони под свою реальную формулу опыта.
// ---------------------------------------------------------------------------
export function XPProgressBar({ profile }: { profile: UserProfile | null }) {
  if (!profile) return null;

  const level = profile.level ?? 1;
  const points = profile.points ?? 0;
  const xpForNextLevel = level * 100;
  const xpIntoLevel = points % xpForNextLevel;
  const percent = Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
        <span className="text-gray-500">До уровня {level + 1}</span>
        <span className="text-[#7C5CFF]">
          {xpIntoLevel} / {xpForNextLevel} XP
        </span>
      </div>
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-[#7C5CFF] to-indigo-500"
        />
      </div>
    </div>
  );
}
