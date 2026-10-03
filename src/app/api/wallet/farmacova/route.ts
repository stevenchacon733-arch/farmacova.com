import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { isDemoMode } from "@/lib/catalog";
import { walletConfigured } from "@/lib/wallet/config";
import { generatePass } from "@/lib/wallet/pass";
import { getSettings } from "@/lib/management";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
export async function GET() {
  if (isDemoMode() || !hasSupabaseConfig())
    return Response.json(
      { error: "Las tarjetas reales aún no están disponibles." },
      { status: 503, headers },
    );
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at)
    return Response.json(
      { error: "Inicia sesión con tu correo confirmado." },
      { status: 401, headers },
    );
  if (!walletConfigured())
    return Response.json(
      { error: "Farmacova todavía no ha activado Apple Wallet." },
      { status: 503, headers },
    );
  try {
    const settings = await getSettings();
    const { data: member, error: memberError } = await client
      .from("loyalty_members")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (memberError || !member?.active)
      return Response.json(
        { error: "No tienes una tarjeta activa." },
        { status: 403, headers },
      );
    const { count, error: rewardError } = await client
      .from("loyalty_rewards")
      .select("id", { head: true, count: "exact" })
      .eq("member_id", member.id)
      .is("redeemed_at", null);
    if (rewardError) throw new Error("REWARDS_UNAVAILABLE");
    const pass = await generatePass(member, count ?? 0, settings.loyalty_terms);
    return new Response(pass, {
      headers: {
        ...headers,
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": 'attachment; filename="Farmacova.pkpass"',
      },
    });
  } catch {
    return Response.json(
      {
        error:
          "No pudimos emitir la tarjeta. Intenta nuevamente o contacta con Farmacova.",
      },
      { status: 503, headers },
    );
  }
}
