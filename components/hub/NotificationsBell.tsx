"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, Video, Radio, MessageSquare, Trophy, Info } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  fetchNotifications,
  markAllNotificationsRead,
} from "@/lib/api/features";
import type { AppNotification } from "@/types/hub";
import type { User } from "@supabase/supabase-js";

interface NotificationsBellProps {
  user: User | null;
}

function getNotifIcon(type: AppNotification["type"]) {
  switch (type) {
    case "new_video":
      return <Video className="w-4 h-4 text-red-400" />;
    case "stream_start":
      return <Radio className="w-4 h-4 text-emerald-400" />;
    case "ama_reply":
      return <MessageSquare className="w-4 h-4 text-blue-400" />;
    case "achievement":
      return <Trophy className="w-4 h-4 text-amber-400" />;
    default:
      return <Info className="w-4 h-4 text-gray-400" />;
  }
}

export function NotificationsBell({ user }: NotificationsBellProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    let active = true;

    async function load() {
      setLoading(true);
      const data = await fetchNotifications(user!.id);
      if (active) setNotifications(data);
      setLoading(false);
    }

    load();

    // Подписка на realtime уведомления
    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const newNotif = payload.new as AppNotification;
          if (!newNotif.user_id || newNotif.user_id === user!.id) {
            setNotifications((prev) => [newNotif, ...prev].slice(0, 10));
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Закрытие по клику вне
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function handleMarkAll() {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllNotificationsRead(user.id);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-all"
      >
        <Bell className="w-4 h-4 text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#12151E]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-sm font-bold text-white">Уведомления</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-xs text-[#7C5CFF] hover:text-[#9D7FFF] flex items-center gap-1"
                >
                  <Check className="w-3 h-3" /> Прочитать все
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {!user ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">
                    Войди в аккаунт, чтобы получать уведомления
                  </p>
                </div>
              ) : loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-lg bg-white/[0.03] animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Пока нет уведомлений</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-3.5 border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer ${
                      !notif.read ? "bg-[#7C5CFF]/5" : ""
                    }`}
                    onClick={() => {
                      if (notif.link) window.location.href = notif.link;
                    }}
                  >
                    <div className="mt-0.5 shrink-0">{getNotifIcon(notif.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white truncate">{notif.title}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-2">{notif.body}</p>
                      <p className="text-[10px] text-gray-600 mt-1">
                        {new Date(notif.created_at).toLocaleString("ru-RU", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-[#7C5CFF] shrink-0 mt-1.5" />
                    )}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
