import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

// Enlaces de los correos (supabase/templates): funcionan aunque se abran en
// otro navegador o en el celular, a diferencia del flujo PKCE de /auth/callback.
const destinations: Partial<Record<EmailOtpType, string>> = {
  recovery: "/auth/actualizar-clave",
  email_change: "/cuenta/seguridad",
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = (params.get("type") ?? "email") as EmailOtpType;
  let destination = "/auth?error=enlace";
  if (hasSupabaseConfig()) {
    // Supabase valida el enlace: un token o tipo inválido devuelve error.
    const { error } = await (
      await createClient()
    ).auth.verifyOtp({ token_hash: params.get("token_hash") ?? "", type });
    if (!error) destination = destinations[type] ?? "/cuenta";
  }
  return NextResponse.redirect(new URL(destination, request.url), {
    headers: { "Cache-Control": "private, no-store" },
  });
}
