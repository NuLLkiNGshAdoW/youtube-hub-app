"use client";

import Link from "next/link";
import {
  ArrowRight,
  Flame,
  Image as ImageIcon,
  LogOut,
  MessageSquare,
  ShieldCheck,
  Trophy,
  User as UserIcon,
  Zap,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/hub";
import { BreathingCard } from "./BreathingCard";
import { StatusIndicator } from "./StatusIndicator";
import { ParticipantCounter } from "./ParticipantCounter";
import { XPProgressBar } from "./XPProgressBar";

interface HeroSectionProps {
  user: User | null;
  profile: UserProfile | null;
  onLogin: (provider: "google" | "discord") => void;
  onLogout: () => void;
}

export function HeroSection({ user, profile, onLogin, onLogout }: HeroSectionProps) {
  const currentAvatar =
    profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture;

  return (
    <BreathingCard className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12151E]/70 backdrop-blur-xl p-6 sm:p-12 md:p-16 shadow-2xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#7C5CFF]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
        <div className="max-w-xl text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
            <StatusIndicator />
            <ParticipantCounter />
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight mb-4 leading-tight">
            {user ? (
              <>
                Привет,{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] via-purple-400 to-red-500">
                  {profile?.username || user.user_metadata?.full_name || "боец"}
                </span>
              </>
            ) : (
              <>
                Null
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7C5CFF] via-purple-400 to-red-500">
                  KinG
                </span>{" "}
                Hub
              </>
            )}
          </h1>

          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed font-normal">
            {user
              ? "Ты в игре. Загружай фан-арт, участвуй в AMA и поднимайся в Top Legends."
              : "Командный центр игрового сообщества: делись фан-артами, общайся и прокачивай уровень."}
          </p>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
            <Link
              href="/gallery"
              className="group flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7C5CFF] to-indigo-600 text-white font-semibold text-sm hover:opacity-90 hover:shadow-lg hover:shadow-[#7C5CFF]/30 transition-all active:scale-95"
            >
              <ImageIcon className="w-4 h-4" />
              <span>В галерею фан-арта</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/ama"
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 font-semibold text-sm hover:bg-white/10 hover:border-white/20 transition-all text-gray-300 hover:text-white"
            >
              <MessageSquare className="w-4 h-4 text-[#3B82F6]" />
              <span>Задать вопрос</span>
            </Link>
          </div>
        </div>

        {/* ПРОФИЛЬ / АВТОРИЗАЦИЯ */}
        <div
          id="auth-panel"
          className="w-full md:w-80 rounded-2xl border border-white/10 bg-[#0B0D12]/80 backdrop-blur-md p-6 shadow-xl relative overflow-hidden group scroll-mt-24"
        >
          <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#7C5CFF]/20 rounded-full blur-xl group-hover:bg-[#7C5CFF]/30 transition-all" />

          {user ? (
            <div className="text-center relative z-10">
              <div className="relative w-20 h-20 mx-auto mb-4">
                <div className="w-20 h-20 rounded-full bg-[#1A1D28] border-2 border-[#7C5CFF]/40 overflow-hidden flex items-center justify-center">
                  {currentAvatar ? (
                    <img
                      src={currentAvatar}
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-[#7C5CFF]" />
                  )}
                </div>
                <span
                  className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-[#0B0D12] rounded-full"
                  title="Онлайн"
                />
              </div>

              <h3 className="font-bold text-white text-lg mb-0.5 truncate">
                {profile?.username || user.user_metadata?.full_name || user.email}
              </h3>

              <p className="text-xs text-emerald-400 mb-4 font-medium flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> Участник сообщества
              </p>

              <div className="grid grid-cols-2 gap-2.5 mb-2 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 fill-current" />
                    <span>{profile?.points ?? 0}</span>
                  </div>
                  <span className="text-[10px] text-amber-300/70 font-medium">Очки XP</span>
                </div>

                <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-[#7C5CFF]/10 border border-[#7C5CFF]/20">
                  <div className="flex items-center gap-1 text-[#7C5CFF] text-xs font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Ур. {profile?.level ?? 1}</span>
                  </div>
                  <span className="text-[10px] text-[#7C5CFF]/70 font-medium">Уровень</span>
                </div>
              </div>

              <XPProgressBar profile={profile} />

              <button
                onClick={onLogout}
                className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Выйти из аккаунта
              </button>
            </div>
          ) : (
            <div className="relative z-10">
              <div className="flex items-center gap-2 text-white font-bold text-base mb-1">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>Вход в аккаунт</span>
              </div>
              <p className="text-xs text-gray-400 mb-5 leading-normal">
                Авторизуйтесь, чтобы загружать свои работы и копить опыт.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => onLogin("google")}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-900 font-semibold text-xs hover:bg-gray-100 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  Войти через Google
                </button>

                <button
                  onClick={() => onLogin("discord")}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#5865F2] text-white font-semibold text-xs hover:bg-[#4752C4] transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                    <path d="M107.7 8.07A105.15 105.15 0 0 0 81.47 0a72.06 72.06 0 0 0-3.36 6.83 97.68 97.68 0 0 0-29.11 0A72.37 72.37 0 0 0 45.64 0a105.89 105.89 0 0 0-26.25 8.09C2.79 32.65-1.71 56.6.54 80.21a105.73 105.73 0 0 0 32.17 16.15 77.7 77.7 0 0 0 6.89-11.11 68.42 68.42 0 0 1-10.85-5.18c.91-.66 1.8-1.34 2.66-2a75.57 75.57 0 0 0 64.32 0c.87.71 1.76 1.39 2.66 2a68.68 68.68 0 0 1-10.87 5.19 77 77 0 0 0 6.89 11.1 105.25 105.25 0 0 0 32.19-16.14c2.64-27.38-4.51-51.11-18.91-72.14zM42.45 65.69c-6.22 0-11.32-5.71-11.32-12.72s4.96-12.72 11.32-12.72c6.4 0 11.45 5.76 11.32 12.72 0 7.01-4.96 12.72-11.32 12.72zm42.24 0c-6.22 0-11.32-5.71-11.32-12.72s4.96-12.72 11.32-12.72c6.4 0 11.45 5.76 11.32 12.72 0 7.01-4.92 12.72-11.32 12.72z" />
                  </svg>
                  Войти через Discord
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </BreathingCard>
  );
}
