"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export function Toast({ message }: ToastProps) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl border border-[#7C5CFF]/40 bg-[#14171F]/95 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-md"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#7C5CFF]/20 text-[#7C5CFF]">
            <Sparkles className="h-4 w-4 animate-spin" />
          </div>
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
