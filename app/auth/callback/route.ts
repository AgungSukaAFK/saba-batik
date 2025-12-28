import { createClient } from "@/utils/supabase/server"; //
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/"; // Redirect default ke Home

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika error, kembalikan ke halaman auth dengan indikator error
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
