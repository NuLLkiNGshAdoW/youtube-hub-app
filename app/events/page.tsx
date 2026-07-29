"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Calendar, Radio, Users, Trophy, Bell, Clock, Sparkles, Check } from "lucide-react";

export interface CommunityEvent {
  id: number;
  title: string;
  description: string | null;
  event_type: "stream" | "tournament" | "gaming" | "other" | string;
  starts_at: string;
  is_active: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [remindedEvents, setRemindedEvents] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("is_active", true)
        .order("starts_at", { ascending: true });

      if (error) {
        console.error("Ошибка загрузки событий:", error.message);
      } else if (data) {
        setEvents(data as CommunityEvent[]);
      }
    } catch (err) {
      console.error("Ошибка:", err);
    } finally {
      setLoading(false);
    }
  };

  // Иконки для разных типов событий
  const getEventIcon = (type: string) => {
    switch (type) {
      case "stream":
        return <Radio className="w-6 h-6 text-[#10B981] animate-pulse" />;
      case "tournament":
        return <Trophy className="w-6 h-6 text-[#F59E0B]" />;
      case "gaming":
        return <Users className="w-6 h-6 text-[#3B82F6]" />;
      default:
        return <Calendar className="w-6 h-6 text-[#7C5CFF]" />;
    }
  };

  // Цвета плашек
  const getEventBadge = (type: string) => {
    switch (type) {
      case "stream":
        return <span className="text-xs font-mono text-[#10B981] font-bold tracking-wider">БЛИЖАЙШИЙ СТРИМ</span>;
      case "tournament":
        return <span className="text-xs font-mono text-[#F59E0B] font-bold tracking-wider">ТУРНИР СООБЩЕСТВА</span>;
      case "gaming":
        return <span className="text-xs font-mono text-[#3B82F6] font-bold tracking-wider">СОВМЕСТНАЯ ИГРА</span>;
      default:
        return <span className="text-xs font-mono text-[#7C5CFF] font-bold tracking-wider">ИВЕНТ</span>;
    }
  };

  // Красивое форматирование даты
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const formatted = date.toLocaleString("ru-RU", {
        weekday: "short",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit"
      });
      // Делаем первую букву дня недели заглавной
      return formatted.charAt(0).toUpperCase() + formatted.slice(1);
    } catch {
      return isoString;
    }
  };

  const handleRemind = (id: number, title: string) => {
    setRemindedEvents((prev) => ({ ...prev, [id]: true }));
    // В будущем здесь можно добавить логику Push-уведомлений или сохранение в профиль
  };

  return (
    <main className="min-h-screen bg-[#0B0D12] pt-24 pb-16 px-5 max-w-5xl mx-auto text-white">
      {/* Заголовок страницы */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[#10B981] mb-2">
          <Calendar className="w-5 h-5" />
          <span className="font-mono text-xs uppercase tracking-wider">Расписание и ивенты</span>
        </div>
        <h1 className="text-3xl font-bold">События сообщества</h1>
        <p className="text-sm text-[#8B93A7] mt-1">
          Стримы, совместные игры и турниры среди подписчиков NullKinG.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#8B93A7]">
          <div className="inline-block w-8 h-8 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-mono">Загрузка актуальных событий...</p>
        </div>
      ) : events.length === 0 ? (
        <div className="text-center text-[#8B93A7] py-16 border border-dashed border-white/10 rounded-2xl bg-[#14171F]/40">
          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50 text-[#10B981]" />
          <p className="text-sm">На данный момент анонсов нет. Следите за обновлениями!</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => {
            const isStream = event.event_type === "stream";
            const isReminded = remindedEvents[event.id];

            return (
              <div
                key={event.id}
                className={`rounded-2xl border p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
                  isStream 
                    ? "border-[#10B981]/30 bg-gradient-to-r from-[#10B981]/10 to-transparent shadow-lg shadow-[#10B981]/5" 
                    : "border-white/10 bg-[#14171F] hover:border-white/20"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 ${
                    isStream ? "bg-[#10B981]/20 border border-[#10B981]/30" : "bg-white/5 border border-white/10"
                  }`}>
                    {getEventIcon(event.event_type)}
                  </div>
                  <div>
                    {getEventBadge(event.event_type)}
                    <h3 className="text-xl font-bold text-white mt-1">{event.title}</h3>
                    {event.description && (
                      <p className="text-xs text-[#8B93A7] mt-1 max-w-xl leading-relaxed">
                        {event.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-[#8B93A7] font-mono mt-3">
                      <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>{formatDate(event.starts_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRemind(event.id, event.title)}
                  disabled={isReminded}
                  className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                    isReminded
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default"
                      : isStream
                      ? "bg-[#10B981] text-black hover:opacity-90 shadow-md shadow-[#10B981]/20 active:scale-95"
                      : "bg-white/10 border border-white/10 text-white hover:bg-white/15 active:scale-95"
                  }`}
                >
                  {isReminded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Напомним!
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      Напомнить
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}