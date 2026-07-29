"use client";

import { MessageSquare, Radio, Sparkles, Trophy, User as UserIcon, Image as ImageIcon } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { PulseItem, UserProfile } from "@/types/hub";
import { MOCK_PULSE } from "@/lib/hub/constants";
import { BreathingCard } from "./BreathingCard";
import { CtaBlock } from "./CtaBlock";

function pulseIcon(type: PulseItem["type"]) {
  switch (type) {
    case "level_up":
      return <Trophy className="w-4 h-4 text-amber-400" />;
    case "fan_art":
      return <ImageIcon className="w-4 h-4 text-[#7C5CFF]" />;
    case "join":
      return <Sparkles className="w-4 h-4 text-emerald-400" />;
    default:
      return <MessageSquare className="w-4 h-4 text-[#3B82F6]" />;
  }
}

interface CommunityPulseSectionProps {
  user: User | null;
  profile: UserProfile | null;
}

export function CommunityPulseSection({ user, profile }: CommunityPulseSectionProps) {
  return (
    <BreathingCard>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Radio className="w-5 h-5 text-emerald-400" />
            Community Pulse
          </h2>
          <p className="text-xs text-gray-400 mt-1">Что сейчас происходит в сообществе</p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md divide-y divide-white/5 overflow-hidden">
        {MOCK_PULSE.map((item) => (
          <div key={item.id} className="flex items-center gap-4 p-4 sm:p-5 hover:bg-white/[0.03] transition-colors">
            <div className="w-10 h-10 rounded-full bg-[#1A1D28] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
              {item.avatar_url ? (
                <img src={item.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 truncate">
                <span className="font-semibold text-white">Игрок</span> {item.text}
              </p>
              <p className="text-[11px] text-gray-500 mt-0.5">{item.time}</p>
            </div>
            <div className="shrink-0">{pulseIcon(item.type)}</div>
          </div>
        ))}
      </div>

      <CtaBlock user={user} profile={profile} hint="Загляни в галерею — там уже есть новые работы." />
    </BreathingCard>
  );
}
