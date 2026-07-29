import { supabase } from "@/lib/supabase/client";
import type {
  AppNotification,
  Poll,
  ScheduledStream,
  StreakInfo,
  WeeklyChallenge,
} from "@/types/hub";

// ---------------------------------------------------------------------------
// Daily Streak — система ежедневных наград
// ---------------------------------------------------------------------------

/**
 * Получает информацию о стрике пользователя.
 * Если пользователь заходит впервые сегодня — обновляет стрик.
 */
export async function getStreakInfo(userId: string): Promise<StreakInfo | null> {
  try {
    const { data, error } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return null;

    const today = new Date().toISOString().split("T")[0];
    const lastVisit = data.last_visit ? data.last_visit.split("T")[0] : null;
    const claimedToday = lastVisit === today;

    return {
      current_streak: data.current_streak ?? 0,
      max_streak: data.max_streak ?? 0,
      last_visit: data.last_visit,
      claimed_today: claimedToday,
    };
  } catch (err) {
    console.error("Ошибка получения стрика:", err);
    return null;
  }
}

/**
 * Забрать ежедневную награду. Увеличивает стрик и начисляет XP.
 * Награда растёт с каждым днём: 10 XP * день (макс 7 дней = 70 XP, потом сброс).
 */
export async function claimDailyStreak(
  userId: string
): Promise<{ success: boolean; xpGained: number; newStreak: number; message: string }> {
  try {
    const { data: existing } = await supabase
      .from("streaks")
      .select("*")
      .eq("user_id", userId)
      .single();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    if (existing) {
      const lastVisit = existing.last_visit ? existing.last_visit.split("T")[0] : null;

      if (lastVisit === today && existing.claimed_today) {
        return {
          success: false,
          xpGained: 0,
          newStreak: existing.current_streak,
          message: "Ты уже забрал награду сегодня. Возвращайся завтра! 🔥",
        };
      }

      // Проверяем, был ли перерыв больше 1 дня
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const isContinued = lastVisit === yesterdayStr;
      const newStreak = isContinued ? (existing.current_streak ?? 0) + 1 : 1;
      const xpGained = Math.min(newStreak, 7) * 10;

      await supabase
        .from("streaks")
        .update({
          current_streak: newStreak,
          max_streak: Math.max(existing.max_streak ?? 0, newStreak),
          last_visit: now.toISOString(),
          claimed_today: true,
        })
        .eq("user_id", userId);

      // Начисляем XP
      await supabase.rpc("add_user_xp", {
        user_id: userId,
        xp_amount: xpGained,
      });

      return {
        success: true,
        xpGained,
        newStreak,
        message: `Стрик ${newStreak} дней! +${xpGained} XP`,
      };
    }

    // Первый стрик
    const xpGained = 10;
    await supabase.from("streaks").insert({
      user_id: userId,
      current_streak: 1,
      max_streak: 1,
      last_visit: now.toISOString(),
      claimed_today: true,
    });

    await supabase.rpc("add_user_xp", {
      user_id: userId,
      xp_amount: xpGained,
    });

    return {
      success: true,
      xpGained,
      newStreak: 1,
      message: `Первый стрик! +${xpGained} XP`,
    };
  } catch (err) {
    console.error("Ошибка клейма стрика:", err);
    return {
      success: false,
      xpGained: 0,
      newStreak: 0,
      message: "Произошла ошибка. Попробуй позже.",
    };
  }
}

// ---------------------------------------------------------------------------
// Notifications — уведомления
// ---------------------------------------------------------------------------

export async function fetchNotifications(userId: string): Promise<AppNotification[]> {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`user_id.eq.${userId},user_id.is.null`)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error || !data) return [];
    return data as AppNotification[];
  } catch (err) {
    console.error("Ошибка загрузки уведомлений:", err);
    return [];
  }
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  try {
    await supabase.from("notifications").update({ read: true }).eq("id", notificationId);
  } catch (err) {
    console.error("Ошибка отметки уведомления:", err);
  }
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  try {
    await supabase
      .from("notifications")
      .update({ read: true })
      .or(`user_id.eq.${userId},user_id.is.null`);
  } catch (err) {
    console.error("Ошибка отметки всех уведомлений:", err);
  }
}

// ---------------------------------------------------------------------------
// Polls — опросы и голосования
// ---------------------------------------------------------------------------

export async function fetchActivePoll(): Promise<Poll | null> {
  try {
    const { data, error } = await supabase
      .from("polls")
      .select(
        `
        id,
        question,
        poll_options (
          id,
          text,
          votes
        )
      `
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      question: data.question,
      options: data.poll_options || [],
      voted_option_id: null,
    };
  } catch {
    return null;
  }
}

export async function votePoll(
  pollId: string,
  optionId: string,
  userId: string
): Promise<boolean> {
  try {
    // Проверяем, не голосовал ли уже
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id")
      .eq("poll_id", pollId)
      .eq("user_id", userId)
      .single();

    if (existingVote) return false;

    // Записываем голос
    await supabase.from("poll_votes").insert({
      poll_id: pollId,
      option_id: optionId,
      user_id: userId,
    });

    // Увеличиваем счётчик голосов
    await supabase.rpc("increment_poll_vote", { option_id: optionId });

    return true;
  } catch (err) {
    console.error("Ошибка голосования:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// YouTube — последние видео
// ---------------------------------------------------------------------------

export async function fetchYouTubeVideos(
  apiKey: string,
  channelId: string,
  maxResults = 4
): Promise<import("@/types/hub").YouTubeVideo[]> {
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=${maxResults}&type=video`
    );

    if (!res.ok) return [];

    const json = await res.json();

    return (json.items || [])
      .filter((item: any) => item.id.videoId)
      .map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        published_at: item.snippet.publishedAt,
      }));
  } catch (err) {
    console.error("Ошибка загрузки YouTube видео:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Scheduled Streams — расписание стримов
// ---------------------------------------------------------------------------

export async function fetchUpcomingStreams(): Promise<ScheduledStream[]> {
  try {
    const { data, error } = await supabase
      .from("scheduled_streams")
      .select("*")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at", { ascending: true })
      .limit(3);

    if (error || !data) return [];
    return data as ScheduledStream[];
  } catch (err) {
    console.error("Ошибка загрузки стримов:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Weekly Challenges — еженедельные челленджи
// ---------------------------------------------------------------------------

export async function fetchActiveChallenge(): Promise<WeeklyChallenge | null> {
  try {
    const { data, error } = await supabase
      .from("weekly_challenges")
      .select("*")
      .eq("is_active", true)
      .gte("ends_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;
    return data as WeeklyChallenge;
  } catch {
    return null;
  }
}

export async function joinChallenge(challengeId: string, userId: string): Promise<boolean> {
  try {
    await supabase.from("challenge_participants").insert({
      challenge_id: challengeId,
      user_id: userId,
    });
    return true;
  } catch (err) {
    console.error("Ошибка присоединения к челленджу:", err);
    return false;
  }
}