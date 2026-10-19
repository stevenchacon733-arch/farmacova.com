import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { safeNext } from "@/lib/validation";
import { MfaChallengeForm } from "@/components/auth/mfa";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Verificación en dos pasos",
  robots: { index: false, follow: false },
};

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = safeNext((await searchParams).next ?? null);
  if (!hasSupabaseConfig()) redirect("/auth");
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at)
    redirect(`/auth?next=${encodeURIComponent(next)}`);
  const { data: aal } = await client.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.nextLevel !== "aal2" || aal.currentLevel === "aal2") redirect(next);
  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-md">
        <ShieldCheck size={36} className="text-green-600" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-bold text-blue-950">
          Verificación en dos pasos
        </h1>
        <p className="mb-7 mt-3 leading-relaxed text-slate-600">
          Escribe el código que muestra tu app de autenticación para terminar de
          ingresar.
        </p>
        <MfaChallengeForm next={next} />
        <div className="mt-8 border-t border-slate-200 pt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
