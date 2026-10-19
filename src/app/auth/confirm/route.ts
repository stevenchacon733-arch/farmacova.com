import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

// Enlaces de los correos (supabase/templates): funcionan aunque se abran en
// otro navegador o en el celular, a diferencia del flujo PKCE de /auth/callback.
const destinations: Partial<Record<EmailOtpType, string>> = {
  email: "/cuenta",
  signup: "/cuenta",
  recovery: "/auth/actualizar-clave",
  email_change: "/cuenta/seguridad",
};

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const destination = type ? destinations[type] : undefined;
  if (hash && type && destination && hasSupabaseConfig()) {
    const client = await createClient();
    const { error } = await client.auth.verifyOtp({ token_hash: hash, type });
    if (!error)
      return NextResponse.redirect(new URL(destination, request.url), {
        headers: { "Cache-Control": "private, no-store" },
      });
  }
  return NextResponse.redirect(new URL("/auth?error=enlace", request.url), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
