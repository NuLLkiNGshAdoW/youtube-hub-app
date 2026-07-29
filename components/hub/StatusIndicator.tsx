"use client";

import { useEffect, useState } from "react";
import { STATUSES } from "@/lib/hub/constants";

// ---------------------------------------------------------------------------
// NullKinG's Status — циклический бейдж "чем сейчас занят канал".
// ---------------------------------------------------------------------------
export function StatusIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % STATUSES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const current = STATUSES[index];
  const Icon = current.icon;

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-[#12151E]/70 backdrop-blur-md px-4 py-2.5">
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
          style={{ backgroundColor: current.color }}
        />
        <span
          className="relative inline-flex rounded-full h-2.5 w-2.5"
          style={{ backgroundColor: current.color }}
        />
      </span>
      <span className="text-xs text-gray-400">NullKinG's Status:</span>
      <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: current.color }}>
        <Icon className="w-3.5 h-3.5" />
        {current.label}
      </span>
    </div>
  );
}
