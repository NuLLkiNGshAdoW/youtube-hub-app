"use client";
import { useEffect, useState } from "react";
import { Play, Video } from "lucide-react";
import { BreathingCard } from "./BreathingCard";
import type { YouTubeVideo } from "@/types/hub";

async function fetchYouTubeVideos() {
  try {
    const response = await fetch("/api/youtube", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      thumbnail: item.thumbnail,
      published_at: item.published_at,
    }));
  } catch (error) {
    console.error("Error fetching YouTube videos:", error);
    throw error;
  }
}

export function YouTubeSection() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchYouTubeVideos();
        setVideos(data);
      } catch (err) {
        console.error("Ошибка загрузки видео:", err);
        setError("Не удалось загрузить видео. Пожалуйста, попробуйте позже.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function formatDate(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Сегодня";
    if (days === 1) return "Вчера";
    if (days < 7) return `${days} дн назад`;
    if (days < 30) return `${Math.floor(days / 7)} нед назад`;
    return `${Math.floor(days / 30)} мес назад`;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <BreathingCard>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Video className="w-5 h-5 text-red-500" />
            Свежие видео
          </h2>
          <p className="text-xs text-gray-400 mt-1">Последние публикации на канале</p>
        </div>
        <a
          href="https://www.youtube.com/@NuIlKinG"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full hover:bg-red-500/20 transition-all"
        >
          <Video className="w-3.5 h-3.5" />
          Подписаться
        </a>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-video rounded-xl bg-white/[0.03] animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-sm text-gray-400">
          На канале пока нет доступных видео для отображения.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {videos.map((video) => (
            <a
              key={video.id}
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-xl overflow-hidden border border-white/10 bg-[#12151E]/70 backdrop-blur-md hover:border-red-500/40 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="p-3.5">
                <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-red-400 transition-colors mb-1.5">
                  {video.title}
                </h3>
                <p className="text-[11px] text-gray-500">{formatDate(video.published_at)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </BreathingCard>
  );
}