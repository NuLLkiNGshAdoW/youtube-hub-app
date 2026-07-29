"use client";

import GallerySection from "@/components/hub/GallerySection";
import { useHubData } from "@/hooks/useHubData";

export default function GalleryPage() {
  const { addXp, toastMessage } = useHubData();

  return (
    <main className="min-h-screen bg-transparent pt-20 pb-16 relative overflow-hidden">
      {/* Тост с сообщением о получении XP */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B82F6] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-2xl border border-white/20 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Раздел Галереи с функцией добавления XP */}
      <GallerySection onAddXp={addXp} />
    </main>
  );
}