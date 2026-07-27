// lib/supabase/auth.ts
export function signInWithProvider(provider: "google" | "discord") {
  // Просто переходим на наш серверный эндпоинт, который корректно сохранит Cookie
  window.location.href = `/auth/login?provider=${provider}`;
}

export async function signOut() {
  const { supabase } = await import("./client");
  await supabase.auth.signOut();
}