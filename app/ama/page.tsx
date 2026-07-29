"use client";

import { useState, useEffect, useMemo, useRef, FormEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import { supabase } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import {
  Mic,
  Send,
  MessageCircle,
  ThumbsUp,
  MessageSquare,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Reply,
  X,
  ShieldCheck,
  Search,
  User as UserIcon,
  EyeOff,
  Eye,
  Link2,
  Check,
} from "lucide-react";
import { ParallaxBackground, BreathingCard } from "@/components/hub";

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
}

interface QuestionAnswer {
  id: number;
  body: string;
  video_timestamp?: string;
  created_at: string;
}

export interface Question {
  id: number;
  created_at: string;
  body: string;
  user_id: string;
  status: string;
  upvotes: number;
  is_hidden?: boolean; // требует миграции, см. комментарий внизу файла
  profiles?: Profile;
  question_answers?: QuestionAnswer[];
}

type SortMode = "recent" | "popular" | "answered" | "mine";

const MAX_QUESTION_LENGTH = 300;

// Ссылка на видео для кликабельных таймкодов, например:
// NEXT_PUBLIC_AMA_VIDEO_URL=https://www.youtube.com/watch?v=XXXXXXXXXXX
const AMA_VIDEO_URL = process.env.NEXT_PUBLIC_AMA_VIDEO_URL || "";

// "12:34" или "1:02:34" -> секунды. Возвращает null, если формат не распознан.
function timestampToSeconds(ts: string): number | null {
  const parts = ts.trim().split(":").map((p) => parseInt(p, 10));
  if (parts.some((p) => Number.isNaN(p))) return null;
  let seconds = 0;
  for (const part of parts) seconds = seconds * 60 + part;
  return seconds;
}

function buildTimestampLink(ts: string): string | null {
  if (!AMA_VIDEO_URL) return null;
  const seconds = timestampToSeconds(ts);
  if (seconds === null) return null;
  const separator = AMA_VIDEO_URL.includes("?") ? "&" : "?";
  return `${AMA_VIDEO_URL}${separator}t=${seconds}s`;
}

export default function InterviewPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState<string>("");
  const [videoTimestamp, setVideoTimestamp] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortMode, setSortMode] = useState<SortMode>("recent");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showHidden, setShowHidden] = useState<boolean>(false);
  const [justSubmitted, setJustSubmitted] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [moderatingId, setModeratingId] = useState<number | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Режим ответа: если не null — форма работает как ответ на конкретный вопрос
  const [replyingTo, setReplyingTo] = useState<Question | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setIsAdmin(profile?.role === "admin");
      }
    });
    fetchQuestions();

    const channel = supabase
      .channel("questions_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "questions" }, () => {
        fetchQuestions();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "question_answers" }, () => {
        fetchQuestions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Горячая клавиша "/" — фокус на поиск (если не печатаем уже в поле)
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === "INPUT" || target.tagName === "TEXTAREA";
      if (e.key === "/" && !isTyping) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Скролл и подсветка вопроса, если в URL есть #question-<id>
  useEffect(() => {
    if (loading || questions.length === 0) return;
    const hash = window.location.hash;
    if (hash.startsWith("#question-")) {
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading, questions.length]);

  const fetchQuestions = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("questions")
      .select(`
        *,
        profiles!questions_user_id_fkey(id, username, avatar_url),
        question_answers(*)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) setQuestions(data as Question[]);
    setLoading(false);
  };

  const handleUpvote = async (questionId: number) => {
    if (!user || votingId === questionId) return;
    setVotingId(questionId);

    const { error } = await supabase
      .from("question_votes")
      .insert([{ user_id: user.id, question_id: questionId }]);

    if (!error) {
      await supabase.rpc("increment_upvotes", { qid: questionId });
      fetchQuestions();
    }
    setVotingId(null);
  };

  const handleToggleHidden = async (q: Question) => {
    if (!isAdmin || moderatingId === q.id) return;
    setModeratingId(q.id);

    const { error } = await supabase
      .from("questions")
      .update({ is_hidden: !q.is_hidden })
      .eq("id", q.id);

    if (!error) {
      await fetchQuestions();
    } else {
      console.error("Ошибка модерации вопроса:", error.message);
    }
    setModeratingId(null);
  };

  const handleCopyLink = async (questionId: number) => {
    const url = `${window.location.origin}${window.location.pathname}#question-${questionId}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(questionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Не удалось скопировать ссылку:", err);
    }
  };

  const startReply = (q: Question) => {
    setReplyingTo(q);
    setNewQuestion("");
    setVideoTimestamp("");
    document.getElementById("composer")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewQuestion("");
    setVideoTimestamp("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newQuestion.trim() || !user || isSubmitting) return;
    setIsSubmitting(true);

    if (replyingTo) {
      // Режим ответа автора на конкретный вопрос
      const { error } = await supabase.from("question_answers").insert([
        {
          question_id: replyingTo.id,
          body: newQuestion.trim(),
          video_timestamp: videoTimestamp.trim() || null,
          answered_by: user.id,
        },
      ]);

      if (!error) {
        await supabase.from("questions").update({ status: "approved" }).eq("id", replyingTo.id);
        setReplyingTo(null);
        setNewQuestion("");
        setVideoTimestamp("");
        await fetchQuestions();
      } else {
        console.error("Ошибка отправки ответа:", error.message);
      }
    } else {
      // Обычный режим — новый вопрос от юзера
      const { error } = await supabase.from("questions").insert([
        { body: newQuestion.trim(), user_id: user.id },
      ]);

      if (!error) {
        setNewQuestion("");
        setJustSubmitted(true);
        setTimeout(() => setJustSubmitted(false), 3000);
        await fetchQuestions(); // обновляем список сразу, не полагаясь только на realtime
      } else {
        console.error("Ошибка отправки вопроса:", error.message);
      }
    }

    setIsSubmitting(false);
  };

  const handleSearchKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setSearchQuery("");
      searchInputRef.current?.blur();
    }
  };

  // Вопросы, доступные для показа (скрытые — только админу с включённым тумблером)
  const baseVisibleQuestions = useMemo(() => {
    if (isAdmin && showHidden) return questions;
    return questions.filter((q) => !q.is_hidden);
  }, [questions, isAdmin, showHidden]);

  const answeredCount = baseVisibleQuestions.filter((q) => (q.question_answers?.length ?? 0) > 0).length;
  const totalUpvotes = baseVisibleQuestions.reduce((sum, q) => sum + (q.upvotes || 0), 0);
  const hiddenCount = questions.filter((q) => q.is_hidden).length;

  const sortedQuestions = useMemo(() => {
    let list = [...baseVisibleQuestions];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter(
        (q) =>
          q.body.toLowerCase().includes(query) ||
          (q.profiles?.username || "").toLowerCase().includes(query)
      );
    }

    if (sortMode === "popular") {
      list.sort((a, b) => b.upvotes - a.upvotes);
    } else if (sortMode === "answered") {
      list = list.filter((q) => (q.question_answers?.length ?? 0) > 0);
    } else if (sortMode === "mine") {
      list = user ? list.filter((q) => q.user_id === user.id) : [];
    }

    return list;
  }, [baseVisibleQuestions, sortMode, searchQuery, user]);

  const remainingChars = MAX_QUESTION_LENGTH - newQuestion.length;

  return (
    <main className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden selection:bg-[#3B82F6]/30 selection:text-[#3B82F6]">
      <ParallaxBackground />

      <div className="max-w-4xl mx-auto space-y-10 relative z-10">
        {/* Hero-заголовок */}
        <BreathingCard className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#12151E]/70 backdrop-blur-xl p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#0B0D12]/60 backdrop-blur-md px-4 py-2 mb-6 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#3B82F6] opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#3B82F6]" />
              </span>
              <Mic className="w-3.5 h-3.5 text-[#3B82F6]" />
              <span className="font-mono uppercase tracking-wider text-[#3B82F6]">Прямой диалог</span>
              {isAdmin && (
                <span className="flex items-center gap-1 ml-1 pl-2 border-l border-white/10 text-emerald-400">
                  <ShieldCheck className="w-3.5 h-3.5" /> Режим автора
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
              Интервью с{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] via-sky-400 to-[#7C5CFF]">
                автором
              </span>
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
              {isAdmin
                ? "Ты вошёл как автор. Нажимай «Ответить» под нужным вопросом, чтобы прикрепить ответ именно к нему."
                : "Задай вопрос NullKinG. Самые популярные попадут в следующий ролик или стрим."}
            </p>

            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <MessageCircle className="w-4 h-4 text-[#3B82F6]" />
                <span className="text-sm font-bold text-white">{baseVisibleQuestions.length}</span>
                <span className="text-xs text-gray-400">вопросов</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-bold text-white">{answeredCount}</span>
                <span className="text-xs text-gray-400">отвечено</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-white">{totalUpvotes}</span>
                <span className="text-xs text-gray-400">голосов всего</span>
              </div>
              {isAdmin && hiddenCount > 0 && (
                <button
                  onClick={() => setShowHidden((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    showHidden
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                      : "bg-white/[0.03] border-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {showHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span>{hiddenCount} скрыт{hiddenCount === 1 ? "" : "о"}</span>
                </button>
              )}
            </div>
          </div>
        </BreathingCard>

        {/* Форма — универсальная: обычный вопрос ИЛИ ответ на конкретный (reply-режим) */}
        <BreathingCard>
          {user ? (
            <form
              id="composer"
              onSubmit={handleSubmit}
              className={`rounded-2xl border p-5 shadow-xl transition-colors ${
                replyingTo
                  ? "border-[#7C5CFF]/40 bg-gradient-to-br from-[#7C5CFF]/[0.06] to-[#12151E]/70"
                  : "border-white/10 bg-[#12151E]/70"
              } backdrop-blur-md`}
            >
              {/* Плашка "Отвечаю на..." как в мессенджерах */}
              {replyingTo && (
                <div className="flex items-start justify-between gap-3 mb-3 p-3 rounded-xl bg-[#0B0D12]/70 border-l-4 border-[#7C5CFF]">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#7C5CFF] flex items-center gap-1.5 mb-1">
                      <Reply className="w-3.5 h-3.5" />
                      Ответ для {replyingTo.profiles?.username || "Анонимный зритель"}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{replyingTo.body}</p>
                  </div>
                  <button
                    type="button"
                    onClick={cancelReply}
                    className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Отменить ответ"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-grow relative">
                  <input
                    type="text"
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value.slice(0, MAX_QUESTION_LENGTH))}
                    placeholder={
                      replyingTo ? "Напиши ответ автора..." : "О чём хочешь спросить NullKinG?"
                    }
                    disabled={isSubmitting}
                    maxLength={MAX_QUESTION_LENGTH}
                    className="w-full bg-[#0B0D12] border border-white/10 rounded-xl px-4 py-3 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] disabled:opacity-50 transition-colors"
                  />
                  {newQuestion.length > 0 && (
                    <span
                      className={`absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono ${
                        remainingChars <= 20 ? "text-amber-400" : "text-gray-600"
                      }`}
                    >
                      {remainingChars}
                    </span>
                  )}
                </div>
                {replyingTo && (
                  <input
                    type="text"
                    value={videoTimestamp}
                    onChange={(e) => setVideoTimestamp(e.target.value)}
                    placeholder="12:34 (необязательно)"
                    disabled={isSubmitting}
                    className="w-full sm:w-36 bg-[#0B0D12] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] disabled:opacity-50 transition-colors"
                  />
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !newQuestion.trim()}
                  className={`group flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer ${
                    replyingTo
                      ? "bg-gradient-to-r from-[#7C5CFF] to-indigo-600 hover:shadow-lg hover:shadow-[#7C5CFF]/30"
                      : "bg-gradient-to-r from-[#3B82F6] to-sky-500 hover:shadow-lg hover:shadow-[#3B82F6]/30"
                  } hover:opacity-90`}
                >
                  <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  {isSubmitting ? "Отправка..." : replyingTo ? "Ответить" : "Отправить"}
                </button>
              </div>

              {justSubmitted && (
                <p className="flex items-center gap-1.5 text-xs text-emerald-400 mt-3">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Вопрос отправлен! Он появится в списке ниже.
                </p>
              )}
            </form>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
              <Mic className="w-6 h-6 mx-auto mb-2 text-gray-500" />
              <p className="text-sm text-gray-400">
                Войдите через Google или Discord на главной странице, чтобы задать вопрос.
              </p>
            </div>
          )}
        </BreathingCard>

        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Поиск по вопросам или авторам... (нажми /)"
            className="w-full bg-[#12151E]/70 border border-white/10 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6] backdrop-blur-md transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              title="Очистить поиск"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {/* Фильтры сортировки */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "recent" as const, label: "Новые", icon: Clock },
              { id: "popular" as const, label: "Популярные", icon: Flame },
              { id: "answered" as const, label: "Отвеченные", icon: CheckCircle2 },
              ...(user ? [{ id: "mine" as const, label: "Мои вопросы", icon: UserIcon }] : []),
            ]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSortMode(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                sortMode === tab.id
                  ? "bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20"
                  : "bg-white/[0.03] text-gray-400 border border-white/10 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Список вопросов */}
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 rounded-2xl border border-white/10 bg-[#12151E]/70 backdrop-blur-md animate-pulse"
                />
              ))}
            </div>
          ) : sortedQuestions.length === 0 ? (
            <div className="text-center text-gray-500 py-16 border border-dashed border-white/10 rounded-2xl bg-[#12151E]/40">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-40 text-[#3B82F6]" />
              <p className="text-sm">
                {searchQuery
                  ? `Ничего не найдено по запросу «${searchQuery}».`
                  : sortMode === "answered"
                  ? "Пока нет отвеченных вопросов."
                  : sortMode === "mine"
                  ? "Ты ещё не задавал вопросов."
                  : "Вопросов пока нет. Будь первым!"}
              </p>
            </div>
          ) : (
            sortedQuestions.map((q, index) => {
              const answer = q.question_answers?.[0] || null;
              const isTop = sortMode === "popular" && index === 0 && q.upvotes > 0;
              const isBeingRepliedTo = replyingTo?.id === q.id;
              const isMine = user?.id === q.user_id;
              const timestampLink = answer?.video_timestamp ? buildTimestampLink(answer.video_timestamp) : null;

              return (
                <div
                  key={q.id}
                  id={`question-${q.id}`}
                  className={`group relative rounded-2xl border p-5 transition-all duration-300 backdrop-blur-md scroll-mt-24 ${
                    isBeingRepliedTo
                      ? "border-[#7C5CFF]/60 bg-[#7C5CFF]/[0.06] ring-1 ring-[#7C5CFF]/30"
                      : q.is_hidden
                      ? "border-rose-500/30 bg-rose-500/[0.03] opacity-70"
                      : isTop
                      ? "border-amber-400/40 bg-gradient-to-br from-amber-500/[0.07] to-[#12151E]/70 shadow-lg shadow-amber-500/5"
                      : "border-white/10 bg-[#12151E]/70 hover:border-[#3B82F6]/40 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#3B82F6]/5"
                  }`}
                >
                  {isTop && !isBeingRepliedTo && (
                    <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-black">
                      <Flame className="w-3 h-3" /> ТОП ВОПРОС
                    </span>
                  )}
                  {q.is_hidden && (
                    <span className="absolute -top-2.5 left-5 flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-bold text-white">
                      <EyeOff className="w-3 h-3" /> СКРЫТО
                    </span>
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#1A1D28] border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {q.profiles?.avatar_url ? (
                          <img
                            src={q.profiles.avatar_url}
                            alt={q.profiles.username}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <MessageCircle className="w-3.5 h-3.5 text-gray-500" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[#3B82F6]">
                        {q.profiles?.username || "Анонимный зритель"}
                      </span>
                      {isMine && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-gray-400 border border-white/10">
                          вы
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {new Date(q.created_at).toLocaleDateString("ru-RU", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-sm text-gray-100 leading-relaxed">{q.body}</p>

                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-white/5 flex-wrap">
                    <button
                      onClick={() => handleUpvote(q.id)}
                      disabled={votingId === q.id || !user}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-[#3B82F6] hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${votingId === q.id ? "animate-pulse" : ""}`} />
                      <span>{q.upvotes}</span>
                    </button>

                    <button
                      onClick={() => handleCopyLink(q.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all text-xs font-semibold cursor-pointer"
                      title="Скопировать ссылку на вопрос"
                    >
                      {copiedId === q.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Link2 className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {answer ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Отвечено
                      </span>
                    ) : (
                      <span className="text-[11px] font-mono text-gray-600">Ожидает ответа</span>
                    )}

                    <div className="ml-auto flex items-center gap-2">
                      {/* Кнопка "Ответить" — видна только автору/админу и только для вопросов без ответа */}
                      {isAdmin && !answer && (
                        <button
                          onClick={() => (isBeingRepliedTo ? cancelReply() : startReply(q))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            isBeingRepliedTo
                              ? "bg-[#7C5CFF] text-white"
                              : "bg-[#7C5CFF]/10 border border-[#7C5CFF]/30 text-[#7C5CFF] hover:bg-[#7C5CFF]/20"
                          }`}
                        >
                          <Reply className="w-3.5 h-3.5" />
                          {isBeingRepliedTo ? "Отменить" : "Ответить"}
                        </button>
                      )}

                      {/* Скрыть/вернуть вопрос — модерация, только для админа */}
                      {isAdmin && (
                        <button
                          onClick={() => handleToggleHidden(q)}
                          disabled={moderatingId === q.id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                            q.is_hidden
                              ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                              : "bg-white/[0.03] border border-white/10 text-gray-400 hover:text-rose-400 hover:border-rose-500/30"
                          }`}
                          title={q.is_hidden ? "Вернуть вопрос в общий список" : "Скрыть вопрос (спам/оффтоп)"}
                        >
                          {q.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          {q.is_hidden ? "Вернуть" : "Скрыть"}
                        </button>
                      )}
                    </div>
                  </div>

                  {answer && (
                    <div className="mt-3 p-4 rounded-xl border border-[#7C5CFF]/25 bg-gradient-to-br from-[#7C5CFF]/[0.08] to-transparent">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-[#7C5CFF]">
                          <MessageSquare className="w-3.5 h-3.5" /> Ответ NullKinG
                        </span>
                        {answer.video_timestamp && (
                          timestampLink ? (
                            <a
                              href={timestampLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20 hover:bg-amber-400/20 transition-colors cursor-pointer"
                              title="Открыть этот момент на видео"
                            >
                              ⏱ {answer.video_timestamp}
                            </a>
                          ) : (
                            <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                              ⏱ {answer.video_timestamp}
                            </span>
                          )
                        )}
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed">{answer.body}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}

/*
  ЧТО НУЖНО ДЛЯ ПОЛНОЙ РАБОТЫ:

  1. Кликабельные таймкоды:
     Добавь в .env переменную с URL видео, например:
       NEXT_PUBLIC_AMA_VIDEO_URL=https://www.youtube.com/watch?v=XXXXXXXXXXX
     Без неё таймкоды просто отображаются как раньше (не кликабельны).

  2. Модерация (скрытие вопросов) — нужна колонка is_hidden в таблице questions:
       ALTER TABLE questions ADD COLUMN is_hidden boolean NOT NULL DEFAULT false;
     Без миграции кнопки "Скрыть/Вернуть" будут отображаться, но апдейт будет падать
     с ошибкой в консоль (поле не найдено) — просто добавь колонку перед деплоем.

  3. "Мои вопросы" и поиск работают полностью на существующих полях, миграций не требуют.
*/