// lib/supabase/auth.ts
import { supabase } from "./client";

export async function signInWithProvider(provider: "google" | "discord") {
  await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: `${location.origin}/auth/callback` },
  });
}

export async function signOut() {
  await supabase.auth.signOut();
}