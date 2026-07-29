"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase/client";

export function useHubData() {
  const { user, profile } = useUser();

  const [xp, setXp] = useState<number>(0);
  const [dailyClaimed, setDailyClaimed] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Синхронизация XP с базой данных Supabase или localStorage
  useEffect(() => {
    if (profile?.points !== undefined) {
      setXp(profile.points);
    } else {
      const savedXp = localStorage.getItem("hub_xp");
      if (savedXp) setXp(parseInt(savedXp, 10));
    }

    const savedDaily = localStorage.getItem("hub_daily_claimed");
    if (savedDaily === new Date().toDateString()) {
      setDailyClaimed(true);
    }
  }, [profile]);

  // Функция добавления XP (локально + обновление в Supabase)
  const addXp = async (amount: number, reason: string) => {
    const newXp = xp + amount;
    const newLevel = Math.floor(newXp / 500) + 1;

    // Обновляем локальное состояние
    setXp(newXp);
    localStorage.setItem("hub_xp", String(newXp));
    showToast(`+${amount} XP: ${reason}!`);

    // Если пользователь авторизован, обновляем Supabase
    if (user) {
      const { error } = await supabase
        .from("profiles")
        .update({
          points: newXp,
          level: newLevel,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Ошибка обновления XP в Supabase:", error.message);
      }
    }
  };

  const claimDailyXp = () => {
    if (dailyClaimed) return;
    setDailyClaimed(true);
    localStorage.setItem("hub_daily_claimed", new Date().toDateString());
    addXp(50, "Ежедневная награда за вход");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const level = Math.floor(xp / 500) + 1;
  const currentLevelXp = xp % 500;
  const xpToNext = 500;

  return {
    user,
    profile,
    xp,
    level,
    currentLevelXp,
    xpToNext,
    dailyClaimed,
    claimDailyXp,
    addXp,
    toastMessage,
    showToast,
  };
}