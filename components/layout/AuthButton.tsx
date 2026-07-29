"use client";

import { useUser } from "@/hooks/useUser";
import { signInWithProvider, signOut } from "@/lib/supabase/auth";

export function AuthButton() {
  const { user, profile, loading } = useUser();

  if (loading) {
    return <div className="h-9 w-40 animate-pulse rounded-lg bg-white/[0.06]" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => signInWithProvider("google")}
          className="rounded-lg bg-white/[0.06] px-4 py-2 text-sm font-medium ring-1 ring-white/10 transition-colors hover:bg-white/[0.1]"
        >
          Войти через Google
        </button>
        <button
          onClick={() => signInWithProvider("discord")}
          className="rounded-lg bg-[#5865F2]/15 px-4 py-2 text-sm font-medium text-[#5865F2] ring-1 ring-[#5865F2]/30 transition-colors hover:bg-[#5865F2]/25"
        >
          Discord
        </button>
      </div>
    );
  }

  // Получаем URL аватарки: из профиля БД или напрямую из Google OAuth метаданных
  const avatarUrl =
    profile?.avatar_url ||
    user?.user_metadata?.avatar_url ||
    user?.user_metadata?.picture;

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-medium leading-tight">
          {profile?.display_name || profile?.username || user?.user_metadata?.full_name || "Пользователь"}
        </p>
        <p className="font-mono text-xs text-[#8B93A7]">
          Ур. {profile?.level ?? 1} · {profile?.points ?? 0} XP
        </p>
      </div>

      {avatarUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={avatarUrl}
          alt="Аватар"
          className="h-9 w-9 rounded-full object-cover ring-2 ring-[#7C5CFF]/40"
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#7C5CFF]/20 text-sm font-bold text-[#7C5CFF]">
          {(
            profile?.display_name?.[0] ||
            profile?.username?.[0] ||
            user?.email?.[0] ||
            "U"
          ).toUpperCase()}
        </div>
      )}

      <button
        onClick={() => signOut()}
        className="rounded-lg px-2 py-1 text-xs text-[#8B93A7] hover:text-[#E7E9EE]"
      >
        Выйти
      </button>
    </div>
  );
}