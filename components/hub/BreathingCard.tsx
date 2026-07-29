"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

// ---------------------------------------------------------------------------
// Обёртка, которая заставляет карточку/секцию плавно "дышать" при
// попадании в область видимости на скролле.
// ---------------------------------------------------------------------------
export function BreathingCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: [1, 1.012, 1],
      }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{
        opacity: { duration: 0.6, ease: "easeOut" },
        y: { duration: 0.6, ease: "easeOut" },
        scale: { duration: 5, repeat: Infinity, ease: "easeInOut" },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
