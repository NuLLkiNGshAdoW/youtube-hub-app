import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  console.log("=== 🔍 OAUTH CALLBACK DEBUG ===");
  console.log("Full Callback URL:", request.url);
  console.log("Received Code:", code ? "YES" : "NO");

  if (error) {
    console.error("❌ Provider Error:", error, errorDescription);
  }

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) =>
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            ),
        },
      }
    );

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("❌ Exchange Code Error:", exchangeError.message);
    } else {
      console.log("✅ OAuth Session successfully created!");
    }
  }

  // После обмена кодом перенаправляем на главную
  return NextResponse.redirect(`${requestUrl.origin}/`);
}