import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, LeaderboardEntry } from "@/types/hub";

// ---------------------------------------------------------------------------
// Профиль пользователя
// ---------------------------------------------------------------------------

/**
 * Получает профиль пользователя из таблицы profiles.
 * Если профиля ещё нет — создаёт его на основе данных OAuth-провайдера.
 * Также подтягивает avatar_url из OAuth, если он не был сохранён ранее.
 */
export async function syncUserProfile(authUser: User): Promise<UserProfile | null> {
  try {
    const avatarUrl =
      authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || "";

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (data) {
      if (!data.avatar_url && avatarUrl) {
        await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", authUser.id);
        data.avatar_url = avatarUrl;
      }
      return data as UserProfile;
    }

    const username =
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      authUser.email?.split("@")[0] ||
      `user_${Math.random().toString(36).substring(2, 7)}`;

    const { data: newProfile, error: insertError } = await supabase
      .from("profiles")
      .insert([
        {
          id: authUser.id,
          username,
          display_name: authUser.user_metadata?.full_name || username,
          avatar_url: avatarUrl,
          provider: authUser.app_metadata?.provider || "oauth",
        },
      ])
      .select()
      .single();

    if (insertError) {
      if (insertError.code === "23505" || insertError.message?.includes("duplicate key value")) {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (existingProfile) {
          return existingProfile as UserProfile;
        }
      }

      console.error("Ошибка при создании профиля:", insertError.message);
      return null;
    }

    return (newProfile as UserProfile) ?? null;
  } catch (err) {
    console.error("Ошибка синхронизации профиля:", err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Leaderboard
// ---------------------------------------------------------------------------

/** Получить топ участников сообщества по очкам опыта */
export async function fetchTopLeaderboard(limit = 3): Promise<LeaderboardEntry[]> {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, points, level")
      .order("points", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data as LeaderboardEntry[];
  } catch (err) {
    console.error("Ошибка загрузки лидерборда:", err);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Счётчик участников
// ---------------------------------------------------------------------------

/** Получить общее количество зарегистрированных участников */
export async function fetchParticipantCount(): Promise<number | null> {
  const { count, error } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (error || typeof count !== "number") return null;
  return count;
}

// ---------------------------------------------------------------------------
// Аутентификация
// ---------------------------------------------------------------------------

export async function loginWithOAuth(provider: "google" | "discord") {
  await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
}

export async function logoutUser() {
  await supabase.auth.signOut();
}
