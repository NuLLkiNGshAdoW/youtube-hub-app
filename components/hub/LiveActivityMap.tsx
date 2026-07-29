"use client";

import { motion } from "framer-motion";
import { Radar } from "lucide-react";
import { MAP_DOTS } from "@/lib/hub/constants";

// ---------------------------------------------------------------------------
// Live Activity Map — стилизованная тёмная карта с пульсирующими точками.
// ---------------------------------------------------------------------------
export function LiveActivityMap() {
  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0B0D12]/80 backdrop-blur-md p-6 sm:p-8 overflow-hidden">
      <div className="flex items-center gap-2.5 mb-6">
        <Radar className="w-5 h-5 text-[#7C5CFF]" />
        <h3 className="text-base font-bold text-white">Live Activity Map</h3>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      </div>

      <div className="relative w-full h-56 sm:h-64 rounded-xl bg-[#090A0F] border border-white/5 overflow-hidden">
        {/* Декоративная сетка "карты" */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(124,92,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.3) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#7C5CFF]/5 via-transparent to-[#3B82F6]/5" />

        {MAP_DOTS.map((dot) => (
          <div key={dot.id} className="absolute" style={{ left: `${dot.x}%`, top: `${dot.y}%` }}>
            <motion.span
              animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.4, repeat: Infinity, delay: dot.delay, ease: "easeOut" }}
              className="absolute inset-0 rounded-full bg-[#7C5CFF]"
              style={{ width: 10, height: 10 }}
            />
            <span
              className="relative block rounded-full bg-[#7C5CFF]"
              style={{ width: 10, height: 10, boxShadow: "0 0 8px rgba(124,92,255,0.8)" }}
            />
          </div>
        ))}
      </div>

      <p className="text-[11px] text-gray-500 mt-4">
        Точки на карте — участники, активные прямо сейчас. Позиции условны и служат для эффекта присутствия.
      </p>
    </div>
  );
}
