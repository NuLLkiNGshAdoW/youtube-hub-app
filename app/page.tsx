"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import type { LeaderboardEntry, UserProfile } from "@/types/hub";
import { syncUserProfile, fetchTopLeaderboard, loginWithOAuth, logoutUser } from "@/lib/api/hub";
import {
  ParallaxBackground,
  HeroSection,
  CommandCenterSection,
  CommunityPulseSection,
  LeaderboardSection,
  RoadmapSection,
  SectionsGridSection,
  YouTubeSection,
} from "@/components/hub";

// ---------------------------------------------------------------------------
// Главная страница — просто "каркас", который собирает готовую страницу
// из готовых секций. Вся бизнес-логика и стили живут в components/hub/
// и lib/api/hub.ts.
// ---------------------------------------------------------------------------
export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) syncUserProfile(user).then(setProfile);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        syncUserProfile(currentUser).then(setProfile);
      } else {
        setProfile(null);
      }
    });

    fetchTopLeaderboard(3)
      .then(setLeaderboard)
      .finally(() => setLoadingLeaderboard(false));

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = (provider: "google" | "discord") => {
    loginWithOAuth(provider);
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  return (
    <main className="min-h-screen text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden selection:bg-[#7C5CFF]/30 selection:text-[#7C5CFF]">
      <ParallaxBackground />

      <div className="max-w-6xl mx-auto space-y-16">
        <HeroSection user={user} profile={profile} onLogin={handleLogin} onLogout={handleLogout} />
        <CommandCenterSection />
        <CommunityPulseSection user={user} profile={profile} />
        <YouTubeSection />
        <LeaderboardSection
          user={user}
          profile={profile}
          leaderboard={leaderboard}
          loading={loadingLeaderboard}
        />
        <RoadmapSection user={user} profile={profile} />
        <SectionsGridSection user={user} profile={profile} />
      </div>
    </main>
  );
}
