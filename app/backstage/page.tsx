"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Lock, Film, Code, Sparkles } from "lucide-react";

export interface BackstagePost {
  id: number;
  title: string;
  body: string | null;
  video_url: string | null;
  min_role: string;
  published_at: string;
}

export default function BackstagePage() {
  const [posts, setPosts] = useState<BackstagePost[]>([]);
  const [youtubeVideos, setYoutubeVideos] = useState<Array<{ id: string; title: string; thumbnail: string; published_at: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchBackstagePosts();
  }, []);

  const fetchBackstagePosts = async () => {
    try {
      setLoading(true);

      const [{ data, error }, youtubeResponse] = await Promise.all([
        supabase.from("backstage_posts").select("*").order("published_at", { ascending: false }),
        fetch("/api/youtube", { cache: "no-store" }),
      ]);

      if (error) {
        console.error("Ошибка при загрузке backstage постов:", error.message);
      } else if (data) {
        setPosts(data as BackstagePost[]);
      }

      if (youtubeResponse.ok) {
        const youtubeData = await youtubeResponse.json();
        setYoutubeVideos((youtubeData.items || []).slice(0, 4));
      }
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  };

  const getMediaUrl = (url: string | null) => {
    if (!url) return null;

    const trimmed = url.trim();

    if (/youtube\.com\/watch\?v=([^&\s]+)/i.test(trimmed)) {
      const videoId = trimmed.match(/youtube\.com\/watch\?v=([^&\s]+)/i)?.[1];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }

    if (/youtu\.be\/([^?&\s]+)/i.test(trimmed)) {
      const videoId = trimmed.match(/youtu\.be\/([^?&\s]+)/i)?.[1];
      return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
    }

    if (/youtube\.com\/embed\/|youtube-nocookie\.com\/embed\//i.test(trimmed)) {
      return trimmed;
    }

    return trimmed;
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] pt-24 pb-16 px-5 max-w-5xl mx-auto text-white">
      {/* Заголовок страницы */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#F59E0B] mb-2">
          <Lock className="w-5 h-5" />
          <span className="font-mono text-xs uppercase tracking-wider">Эксклюзив</span>
        </div>
        <h1 className="text-3xl font-bold text-white">За кулисами NullKinG</h1>
        <p className="text-sm text-[#8B93A7] mt-1">
          Невошедшие кадры, процессы создания роликов и разработки игр.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#8B93A7]">
          <div className="inline-block w-8 h-8 border-2 border-[#F59E0B] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs">Загрузка эксклюзивного контента...</p>
        </div>
      ) : (
        <>
          {youtubeVideos.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Film className="w-4 h-4 text-[#F59E0B]" />
                <h2 className="text-lg font-semibold text-white">Свежие ролики с канала</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {youtubeVideos.map((video) => (
                  <div key={video.id} className="rounded-2xl border border-white/10 bg-[#14171F] overflow-hidden transition-all hover:border-white/20">
                    <div className="aspect-video bg-[#0B0D12]">
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-white text-base mb-2">{video.title}</h3>
                      <p className="text-xs text-[#8B93A7]">
                        {new Date(video.published_at).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center text-[#8B93A7] py-16 border border-dashed border-white/10 rounded-2xl">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#F59E0B]" />
              <p className="text-sm">Эксклюзивных постов пока нет. Следите за обновлениями!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {posts.map((post) => {
                const mediaUrl = getMediaUrl(post.video_url);
                const isImage = Boolean(mediaUrl && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(mediaUrl));
                const isVideo = Boolean(mediaUrl && (mediaUrl.includes("youtube") || mediaUrl.includes("youtu.be") || mediaUrl.includes("vimeo") || mediaUrl.includes("mp4") || mediaUrl.includes("video")));

                return (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-white/10 bg-[#14171F] overflow-hidden transition-all hover:border-white/20"
                  >
                {/* Медиа превью / Видео */}
                <div className="aspect-video bg-[#0B0D12] flex items-center justify-center relative overflow-hidden rounded-t-2xl">
                  {mediaUrl ? (
                    isVideo ? (
                      <div className="w-full h-full bg-black/20">
                        <iframe
                          src={mediaUrl}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      </div>
                    ) : isImage ? (
                      <div className="w-full h-full relative">
                        <img
                          src={mediaUrl}
                          alt={post.title}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-full relative">
                        <img
                          src={mediaUrl}
                          alt={post.title}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
                      </div>
                    )
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-[#7C5CFF]">
                      <Code className="w-10 h-10" />
                      <span className="text-xs font-mono">DEVLOG</span>
                    </div>
                  )}

                  {/* Бейдж роли */}
                  <span className="absolute top-3 left-3 bg-[#F59E0B]/20 border border-[#F59E0B]/30 text-[#F59E0B] text-[10px] font-mono px-2.5 py-1 rounded-full uppercase backdrop-blur-sm">
                    {post.min_role}
                  </span>
                </div>

                    {/* Информация о посте */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[10px] text-[#8B93A7] font-mono mb-2">
                        <span>
                          {new Date(post.published_at).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base mb-2">{post.title}</h3>
                      {post.body && (
                        <p className="text-xs text-[#8B93A7] leading-relaxed line-clamp-3">
                          {post.body}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </main>
  );
}