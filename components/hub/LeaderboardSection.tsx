"use client";

import { Crown, Medal, User as UserIcon, Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { LeaderboardEntry, UserProfile } from "@/types/hub";
import { BreathingCard } from "./BreathingCard";
import { CtaBlock } from "./CtaBlock";

interface LeaderboardSectionProps {
  user: User | null;
  profile: UserProfile | null;
  leaderboard: LeaderboardEntry[];
  loading: boolean;
}

export function LeaderboardSection({ user, profile, leaderboard, loading }: LeaderboardSectionProps) {
  return (
    <BreathingCard>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <Crown className="w-5 h-5 text-amber-400" />
          Top Legends
        </h2>
        <p className="text-xs text-gray-400 mt-1">Три лидера сообщества по очкам опыта</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-48 rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md animate-pulse" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-8 text-center text-sm text-gray-400">
          Лидерборд пока пуст — стань первым в списке!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {leaderboard.map((entry, index) => {
            const rankColor = index === 0 ? "#F59E0B" : index === 1 ? "#94A3B8" : "#B45309";
            return (
              <div
                key={entry.id}
                className="relative rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 text-center transition-all duration-300 hover:border-[#7C5CFF]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C5CFF]/10"
              >
                <div
                  className="absolute top-4 left-4 flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-black"
                  style={{ backgroundColor: `${rankColor}22`, color: rankColor }}
                >
                  {index + 1}
                </div>
                <Medal className="absolute top-4 right-4 w-5 h-5" style={{ color: rankColor }} />

                <div
                  className="w-16 h-16 mx-auto mb-4 mt-4 rounded-full bg-[#1A1D28] border-2 overflow-hidden flex items-center justify-center"
                  style={{ borderColor: rankColor }}
                >
                  {entry.avatar_url ? (
                    <img src={entry.avatar_url} alt={entry.username} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-gray-500" />
                  )}
                </div>

                <h3 className="font-bold text-white text-sm truncate mb-1">{entry.username}</h3>
                <p className="text-[11px] text-gray-500 mb-4">Уровень {entry.level ?? 1}</p>

                <div className="flex items-center justify-center gap-1.5 text-amber-400 font-bold text-sm">
                  <Zap className="w-4 h-4 fill-current" />
                  {entry.points} XP
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CtaBlock user={user} profile={profile} hint="Продолжай копить XP, чтобы обойти лидеров." />
    </BreathingCard>
  );
}
