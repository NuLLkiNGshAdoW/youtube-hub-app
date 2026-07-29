"use client";

import { Activity } from "lucide-react";
import { BreathingCard } from "./BreathingCard";
import { LiveActivityMap } from "./LiveActivityMap";

export function CommandCenterSection() {
  return (
    <BreathingCard>
      <div className="flex items-center gap-2.5 mb-8">
        <Activity className="w-5 h-5 text-[#7C5CFF]" />
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide">Command Center</h2>
          <p className="text-xs text-gray-400 mt-1">Что происходит в секторе прямо сейчас</p>
        </div>
      </div>
      <LiveActivityMap />
    </BreathingCard>
  );
}
