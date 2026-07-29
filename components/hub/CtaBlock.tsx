"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/hub";

// ---------------------------------------------------------------------------
// CTA-блок: гостю — кнопка регистрации, участнику — приветствие + XP.
// ---------------------------------------------------------------------------
export function CtaBlock({
  user,
  profile,
  hint,
  size = "default",
}: {
  user: User | null;
  profile: UserProfile | null;
  hint: string;
  size?: "default" | "large";
}) {
  if (user) {
    return (
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-white">
            Привет, {profile?.username || user.user_metadata?.full_name || "боец"}!
          </span>{" "}
          {hint}
        </p>
        <div className="flex items-center gap-2 text-xs font-semibold text-[#7C5CFF] bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 px-4 py-2 rounded-full">
          <Zap className="w-3.5 h-3.5 fill-current" />
          {profile?.points ?? 0} XP · Уровень {profile?.level ?? 1}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex justify-center">
      <Link
        href="#auth-panel"
        className={
          size === "large"
            ? "group flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-indigo-600 text-white font-bold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-[#7C5CFF]/30 transition-all active:scale-95"
            : "group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-indigo-600 text-white font-semibold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-[#7C5CFF]/30 transition-all active:scale-95"
        }
      >
        <span>Присоединиться к элите</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
