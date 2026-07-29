"use client";

import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/types/hub";
import { ROADMAP } from "@/lib/hub/constants";
import { BreathingCard } from "./BreathingCard";
import { CtaBlock } from "./CtaBlock";

interface RoadmapSectionProps {
  user: User | null;
  profile: UserProfile | null;
}

export function RoadmapSection({ user, profile }: RoadmapSectionProps) {
  return (
    <BreathingCard>
      <div className="mb-8">
        <h2 className="text-2xl font-black text-white tracking-wide">Content Roadmap</h2>
        <p className="text-xs text-gray-400 mt-1">Над чем работает NullKinG прямо сейчас</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {ROADMAP.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ backgroundColor: `${item.color}1A`, border: `1px solid ${item.color}33`, color: item.color }}
              >
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">{item.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed mb-5">{item.description}</p>

              <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
                <span className="text-gray-500">Прогресс</span>
                <span style={{ color: item.color }}>{item.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${item.progress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <CtaBlock user={user} profile={profile} hint="Скоро откроем предпросмотр — не пропусти." />
    </BreathingCard>
  );
}
