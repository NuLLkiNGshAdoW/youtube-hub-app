"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  points: number;
  level: number;
};

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, username, display_name, avatar_url, points, level")
          .eq("id", user.id)
          .single();

        if (!active) return;
        setProfile(profileData);
      } else {
        setProfile(null);
      }

      if (active) {
        setLoading(false);
      }
    }

    load();

    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}