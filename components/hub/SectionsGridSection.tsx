"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Image as ImageIcon, Lock, MessageSquare } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/hub";
import { BreathingCard } from "./BreathingCard";
import { CtaBlock } from "./CtaBlock";

interface SectionsGridSectionProps {
  user: User | null;
  profile: UserProfile | null;
}

export function SectionsGridSection({ user, profile }: SectionsGridSectionProps) {
  return (
    <BreathingCard>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">Разделы хаба</h2>
          <p className="text-xs text-gray-400 mt-1">Всё самое интересное в одном месте</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Link href="/gallery" className="group">
          <div className="h-full rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 transition-all duration-300 hover:border-[#7C5CFF]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#7C5CFF]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#7C5CFF]/5 rounded-bl-full group-hover:bg-[#7C5CFF]/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#7C5CFF]/10 border border-[#7C5CFF]/20 flex items-center justify-center mb-5 text-[#7C5CFF] group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#7C5CFF] transition-colors">Фан-арт</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Делись рисунками, скриншотами и получай +50 XP в профиль.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#7C5CFF]">
              <span>Смотреть арты</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/ama" className="group">
          <div className="h-full rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 transition-all duration-300 hover:border-[#3B82F6]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#3B82F6]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-bl-full group-hover:bg-[#3B82F6]/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-5 text-[#3B82F6] group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#3B82F6] transition-colors">Интервью</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Задавай вопросы NullKinG и предлагай идеи для роликов.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#3B82F6]">
              <span>Задать вопрос</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/events" className="group">
          <div className="h-full rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 transition-all duration-300 hover:border-[#10B981]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#10B981]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#10B981]/5 rounded-bl-full group-hover:bg-[#10B981]/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center mb-5 text-[#10B981] group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#10B981] transition-colors">События</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Расписание прямых трансляций, турниров и ивентов.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#10B981]">
              <span>Расписание</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>

        <Link href="/backstage" className="group">
          <div className="h-full rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 transition-all duration-300 hover:border-[#F59E0B]/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#F59E0B]/10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#F59E0B]/5 rounded-bl-full group-hover:bg-[#F59E0B]/15 transition-all" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/20 flex items-center justify-center mb-5 text-[#F59E0B] group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#F59E0B] transition-colors">За кулисами</h3>
              <p className="text-xs text-gray-400 leading-relaxed">Эксклюзивные спойлеры, тизеры и бэкстейджи разработки.</p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-[#F59E0B]">
              <span>Открыть доступ</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </Link>
      </div>

      <CtaBlock user={user} profile={profile} hint="Все разделы уже доступны — заходи и участвуй." size="large" />
    </BreathingCard>
  );
}
