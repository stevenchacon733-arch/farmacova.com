import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { safeNext } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeNext(request.nextUrl.searchParams.get("next"));
  if (code && hasSupabaseConfig()) {
    const client = await createClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(new URL(next, request.url), {
        headers: { "Cache-Control": "private, no-store" },
      });
  }
  return NextResponse.redirect(new URL("/auth?error=enlace", request.url), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
