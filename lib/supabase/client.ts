import { createBrowserClient } from "@supabase/ssr";

/**
 * Создает клиент Supabase для использования в клиентских компонентах ("use client").
 * Этот клиент безопасно управляет сессиями через Cookie.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Экспортируем готовый инстанс, чтобы его можно было импортировать 
// в любом месте приложения: import { supabase } from "@/lib/supabase/client";
export const supabase = createClient();