import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";

// Usuario verificado con el servidor (getUser, nunca getSession). Si la cuenta
// tiene verificación en dos pasos y esta sesión aún no la completó, se pide el
// código antes de mostrar nada.
export async function requireVerifiedUser(next: string, signedOutTo = "/auth") {
  if (!hasSupabaseConfig()) redirect(signedOutTo);
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) redirect(signedOutTo);
  const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2")
    redirect(`/auth/verificacion?next=${encodeURIComponent(next)}`);
  return { client, user, aal: aal?.currentLevel ?? "aal1" };
}
