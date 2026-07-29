"use client";

import React, { useState, useRef, DragEvent, useEffect } from "react";
import {
  Upload,
  Image as ImageIcon,
  Heart,
  Search,
  Clock,
  Flame,
  User as UserIcon,
  ShieldCheck,
  Check,
  X,
  Star,
  Link2,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useFanArts, FanArt, GalleryTab } from "@/hooks/useFanArts";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";
import { ParallaxBackground, BreathingCard } from "@/components/hub";

interface GallerySectionProps {
  onAddXp?: (amount: number, reason: string) => void;
}

export default function GallerySection({ onAddXp }: GallerySectionProps) {
  const { user } = useUser();
  const {
    artList,
    loading,
    isAdmin,
    uploading,
    votingId,
    tab,
    setTab,
    searchQuery,
    setSearchQuery,
    pendingCount,
    getImageUrl,
    uploadArt,
    toggleVote,
    moderateArt,
    toggleFeatured,
  } = useFanArts();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAuthor, setSelectedAuthor] = useState<{ id: string; name: string } | null>(null);
  const [messageText, setMessageText] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- превью файла ---
  const handleFileSelect = (f: File | null) => {
    setFile(f);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) handleFileSelect(dropped);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    const { error } = await uploadArt(title, file);
    if (error) {
      alert(`Ошибка при загрузке: ${error}`);
      return;
    }
    if (onAddXp) onAddXp(50, "Загрузка фан-арта (на модерации)");
    setTitle("");
    handleFileSelect(null);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAuthor || !messageText.trim()) return;
    setSendingMsg(true);
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        alert("Войдите в аккаунт, чтобы написать сообщение автору.");
        return;
      }
      const { error } = await supabase.from("messages").insert([
        {
          sender_id: userData.user.id,
          recipient_id: selectedAuthor.id,
          content: messageText.trim(),
        },
      ]);
      if (error) throw error;
      alert(`Сообщение для ${selectedAuthor.name} отправлено!`);
      setSelectedAuthor(null);
      setMessageText("");
    } catch (err: unknown) {
      const error = err as Error;
      alert(`Не удалось отправить сообщение: ${error.message}`);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleCopyLink = async (artId: string) => {
    const url = `${window.location.origin}${window.location.pathname}#art-${artId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(artId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      /* noop */
    }
  };

  // --- скролл к работе по хэшу ---
  useEffect(() => {
    if (loading || artList.length === 0) return;
    const hash = window.location.hash;
    if (hash.startsWith("#art-")) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, artList.length]);

  // --- клавиши для лайтбокса ---
  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") setLightboxIndex((i) => (i === null ? null : Math.min(i + 1, artList.length - 1)));
      if (e.key === "ArrowLeft") setLightboxIndex((i) => (i === null ? null : Math.max(i - 1, 0)));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIndex, artList.length]);

  const tabs: { id: GalleryTab; label: string; icon: typeof Clock }[] = [
    { id: "new", label: "Новые", icon: Clock },
    { id: "popular", label: "Популярные", icon: Flame },
    ...(user ? [{ id: "mine" as const, label: "Мои работы", icon: UserIcon }] : []),
    ...(isAdmin ? [{ id: "moderation" as const, label: `На модерации${pendingCount ? ` (${pendingCount})` : ""}`, icon: ShieldCheck }] : []),
  ];

  const lightboxArt = lightboxIndex !== null ? artList[lightboxIndex] : null;

  const handleToggleVote = (artId: string) => {
    if (!user) {
      alert("Войдите в аккаунт, чтобы ставить лайк.");
      return;
    }
    void toggleVote(artId);
  };

  return (
    <main className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
      <ParallaxBackground />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        {/* Hero */}
        <BreathingCard className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12151E]/70 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0B0D12]/60 backdrop-blur-md px-4 py-2 mb-6 text-xs">
              <ImageIcon className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="font-mono uppercase tracking-wider text-[#3B82F6]">Галерея сообщества</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
              Фан-арт{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-sky-400 to-[#7C5CFF]">
                сообщества
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed">
              Делись своими работами и голосуй за лучшие. Лучшие попадают в «Выбор редакции».
            </p>
          </div>
        </BreathingCard>

        {/* Форма загрузки — drag-n-drop */}
        <BreathingCard>
          {user ? (
            <form
              onSubmit={handleUpload}
              className="rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md p-6 space-y-4 shadow-xl"
            >
              <h3 className="text-lg font-bold text-gray-100">Добавить фан-арт</h3>

              <input
                type="text"
                placeholder="Название работы"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-[#0B0D12] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] transition-colors"
                required
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? "border-[#3B82F6] bg-[#3B82F6]/5"
                    : "border-white/10 hover:border-white/20 bg-white/[0.02]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                  className="hidden"
                />
                {previewUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={previewUrl} alt="Превью" className="w-24 h-24 object-cover rounded-lg border border-white/10" />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-sm text-gray-200 truncate">{file?.name}</p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileSelect(null);
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 mt-1 cursor-pointer"
                      >
                        Убрать файл
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <p className="text-sm text-gray-400">
                      Перетащи изображение сюда или <span className="text-[#3B82F6]">выбери файл</span>
                    </p>
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={uploading || !file || !title.trim()}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#3B82F6] to-sky-500 hover:shadow-lg hover:shadow-[#3B82F6]/30 hover:opacity-90 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                {uploading ? "Загрузка..." : "Опубликовать (+50 XP)"}
              </button>
              <p className="text-[11px] text-gray-500">Работа появится в галерее после проверки модератором.</p>
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <ImageIcon className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">Войдите в аккаунт, чтобы опубликовать работу.</p>
            </div>
          )}
        </BreathingCard>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по названию или автору..."
            className="w-full bg-[#12151E]/70 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] backdrop-blur-md transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Вкладки */}
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                tab === t.id
                  ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
                  : "bg-white/[0.03] text-gray-400 border border-white/10 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Сетка работ */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md animate-pulse" />
            ))}
          </div>
        ) : artList.length === 0 ? (
          <div className="text-center text-gray-500 py-16 border border-dashed border-white/10 rounded-2xl bg-[#12151E]/40">
            <ImageIcon className="w-8 h-8 mx-auto mb-3 opacity-40 text-[#3B82F6]" />
            <p className="text-sm">
              {searchQuery
                ? `Ничего не найдено по запросу «${searchQuery}».`
                : tab === "moderation"
                ? "Нет работ, ожидающих проверки."
                : tab === "mine"
                ? "Ты ещё не опубликовал ни одной работы."
                : "Пока нет работ. Будь первым!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {artList.map((art, index) => {
              const fullImageUrl = getImageUrl(art.file_path);
              const isMine = user?.id === art.user_id;

              return (
                <div
                  key={art.id}
                  id={`art-${art.id}`}
                  className="group relative rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md overflow-hidden hover:border-[#3B82F6]/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#3B82F6]/5 transition-all duration-300 flex flex-col scroll-mt-24"
                >
                  {art.is_featured && (
                    <span className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-black">
                      <Star className="w-3 h-3" /> ВЫБОР РЕДАКЦИИ
                    </span>
                  )}
                  {tab === "moderation" && (
                    <span className="absolute top-3 right-3 z-10 flex items-center gap-1 rounded-full bg-amber-400/90 px-2.5 py-0.5 text-[10px] font-bold text-black">
                      На проверке
                    </span>
                  )}

                  <div
                    className="h-64 overflow-hidden bg-black/40 relative cursor-pointer"
                    onClick={() => setLightboxIndex(index)}
                  >
                    {fullImageUrl ? (
                      <>
                        <img
                          src={fullImageUrl}
                          alt={art.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/600x400/12151E/FFF?text=Ошибка+загрузки";
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleVote(art.id);
                          }}
                          disabled={!user || votingId === art.id}
                          className={`absolute top-3 right-3 z-20 flex items-center gap-1.5 rounded-full border px-3 py-2 text-[11px] font-semibold backdrop-blur-md transition-all ${
                            art.user_has_voted
                              ? "border-rose-500/40 bg-rose-500/90 text-white shadow-lg shadow-rose-500/20"
                              : "border-white/10 bg-black/50 text-white/90 hover:bg-rose-500/70"
                          } ${!user || votingId === art.id ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
                          aria-label={art.user_has_voted ? "Убрать лайк" : "Поставить лайк"}
                        >
                          <Heart className={`w-4 h-4 ${art.user_has_voted ? "fill-white" : ""}`} />
                          <span>{art.votes_count || 0}</span>
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                        Изображение отсутствует
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div className="flex items-center gap-3">
                      {art.profiles?.avatar_url && (
                        <img
                          src={art.profiles.avatar_url}
                          alt="avatar"
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-gray-200 truncate">{art.title}</h4>
                        <p className="text-xs text-gray-400 truncate">
                          {art.profiles?.username || "Аноним"} {isMine && <span className="text-gray-500">(вы)</span>}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => handleToggleVote(art.id)}
                        disabled={!user || votingId === art.id}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                          art.user_has_voted
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                            : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-rose-400 hover:border-rose-500/30"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${art.user_has_voted ? "fill-rose-400" : ""}`} />
                        {art.user_has_voted ? "Убрать лайк" : "Лайк"}
                        <span className="ml-0.5">({art.votes_count || 0})</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(art.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs cursor-pointer"
                        title="Скопировать ссылку"
                      >
                        {copiedId === art.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                      </button>

                      {!isMine && (
                        <button
                          onClick={() =>
                            setSelectedAuthor({ id: art.user_id, name: art.profiles?.username || "Автору" })
                          }
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs cursor-pointer"
                          title="Написать автору"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {isAdmin && (
                        <div className="ml-auto flex items-center gap-2">
                          {tab === "moderation" ? (
                            <>
                              <button
                                onClick={() => moderateArt(art.id, "approved")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" /> Принять
                              </button>
                              <button
                                onClick={() => moderateArt(art.id, "rejected")}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" /> Отклонить
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => toggleFeatured(art)}
                              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border ${
                                art.is_featured
                                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                                  : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-amber-400"
                              }`}
                              title="Выбор редакции"
                            >
                              <Star className={`w-3.5 h-3.5 ${art.is_featured ? "fill-amber-400" : ""}`} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Лайтбокс */}
      {lightboxArt && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {lightboxIndex! > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i === null ? null : i - 1));
              }}
              className="absolute left-4 sm:left-8 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
          )}
          {lightboxIndex! < artList.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex((i) => (i === null ? null : i + 1));
              }}
              className="absolute right-4 sm:right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          )}

          <div className="max-w-4xl max-h-[85vh] w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={getImageUrl(lightboxArt.file_path)}
              alt={lightboxArt.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain max-h-[70vh] rounded-xl"
            />
            <div className="mt-4 flex items-center justify-between text-white">
              <div>
                <h3 className="text-lg font-bold">{lightboxArt.title}</h3>
                <p className="text-sm text-gray-400">{lightboxArt.profiles?.username || "Аноним"}</p>
              </div>
              <button
                onClick={() => handleToggleVote(lightboxArt.id)}
                disabled={!user}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-sm font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                  lightboxArt.user_has_voted
                    ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                    : "bg-white/[0.03] border-white/10 text-gray-300 hover:text-rose-400"
                }`}
              >
                <Heart className={`w-4 h-4 ${lightboxArt.user_has_voted ? "fill-rose-400" : ""}`} />
                {lightboxArt.user_has_voted ? "Убрать лайк" : "Лайк"}
                <span className="ml-1">({lightboxArt.votes_count || 0})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка сообщения автору */}
      {selectedAuthor && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-[#12151E] border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white">
                Сообщение для: <span className="text-[#3B82F6]">{selectedAuthor.name}</span>
              </h3>
              <button onClick={() => setSelectedAuthor(null)} className="text-gray-400 hover:text-white text-xl cursor-pointer">
                ✕
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Напишите ваше сообщение..."
                className="w-full h-32 p-3 bg-[#0B0D12] border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#3B82F6] resize-none"
                required
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedAuthor(null)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="px-5 py-2 bg-[#3B82F6] hover:bg-sky-500 text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition cursor-pointer"
                >
                  {sendingMsg ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}