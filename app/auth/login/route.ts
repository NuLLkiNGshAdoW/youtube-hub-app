// app/api/auth/login/route.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider") as "google" | "discord";

  if (!provider) {
    return NextResponse.redirect(`${origin}/?error=no_provider`);
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Игнорируем вызовы из контекстов, где нельзя ставить куки
          }
        },
      },
    }
  );

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error || !data.url) {
    console.error("❌ OAuth Error:", error?.message);
    return NextResponse.redirect(`${origin}/?error=oauth_init_failed`);
  }

  return NextResponse.redirect(data.url);
}