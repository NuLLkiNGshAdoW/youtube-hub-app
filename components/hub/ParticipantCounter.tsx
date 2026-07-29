"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { fetchParticipantCount } from "@/lib/api/hub";

// ---------------------------------------------------------------------------
// Счётчик участников — реальный count() из таблицы profiles в Supabase.
// ---------------------------------------------------------------------------
export function ParticipantCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetchParticipantCount().then(setCount);
  }, []);

  return (
    <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#12151E]/70 backdrop-blur-md px-4 py-2.5 text-xs text-gray-300">
      <Users className="w-3.5 h-3.5 text-[#7C5CFF]" />
      В нашем секторе уже{" "}
      <span className="font-bold text-white">
        {count === null ? "…" : count.toLocaleString("ru-RU")}
      </span>{" "}
      исследователей
    </div>
  );
}
