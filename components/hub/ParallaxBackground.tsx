"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Satellite } from "lucide-react";

// ---------------------------------------------------------------------------
// Параллакс-фон: 3 слоя — далёкие звёзды (canvas), туманности/планеты
// (framer-motion), ближний дрейфующий спутник.
// ---------------------------------------------------------------------------
export function ParallaxBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const STAR_COUNT = 180;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.3,
      baseOpacity: Math.random() * 0.5 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    let frame = 0;
    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#090A0F";
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle = Math.sin(frame * star.twinkleSpeed + star.phase) * 0.3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.max(0.1, star.baseOpacity + twinkle)})`;
        ctx.fill();
      }

      frame++;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-20 overflow-hidden pointer-events-none">
      {/* Слой 1: далёкие статичные/мерцающие звёзды */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Слой 2: туманности и "планеты" среднего плана */}
      <motion.div
        animate={{ y: [0, 30, 0], x: [0, 15, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[8%] left-[10%] w-72 h-72 rounded-full bg-[#7C5CFF]/10 blur-[100px]"
      />
      <motion.div
        animate={{ y: [0, -25, 0], x: [0, -20, 0] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[40%] right-[8%] w-96 h-96 rounded-full bg-[#3B82F6]/10 blur-[120px]"
      />
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-[10%] left-[20%] w-64 h-64 rounded-full bg-emerald-500/10 blur-[110px]"
      />
      {/* Стилизованная "планета" с кольцом */}
      <motion.div
        animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:block absolute top-[15%] right-[15%] w-20 h-20 rounded-full bg-gradient-to-br from-[#7C5CFF]/40 to-transparent border border-[#7C5CFF]/20"
        style={{ boxShadow: "0 0 60px rgba(124,92,255,0.15)" }}
      />

      {/* Слой 3: ближний медленно дрейфующий спутник */}
      <motion.div
        initial={{ x: "-10vw", y: "20vh" }}
        animate={{ x: "110vw", y: ["20vh", "26vh", "18vh", "24vh"] }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
        className="hidden sm:flex absolute w-10 h-10 items-center justify-center text-white/25"
      >
        <Satellite className="w-8 h-8" />
      </motion.div>
    </div>
  );
}
