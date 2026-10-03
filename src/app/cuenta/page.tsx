import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  if (!hasSupabaseConfig()) redirect("/auth");
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at) redirect("/auth");
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("created_at")
    .eq("id", user.id)
    .maybeSingle();
  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-8">
        <ShieldCheck size={36} className="text-green-600" aria-hidden="true" />
        <span className="eyebrow mt-6 block">
          Tu perfil de cliente frecuente
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-blue-950">
          Bienvenido a Farmacova
        </h1>
        <p className="mt-4 break-all text-slate-600">{user.email}</p>
        <p className="mt-3 text-sm text-green-700">Correo confirmado</p>
        {profile?.created_at && (
          <p className="mt-3 text-sm text-slate-500">
            Miembro desde{" "}
            {new Intl.DateTimeFormat("es-CR", {
              dateStyle: "long",
              timeZone: "America/Costa_Rica",
            }).format(new Date(profile.created_at))}
          </p>
        )}
        {profileError && (
          <p role="status" className="mt-4 text-sm text-slate-500">
            Tu sesión está activa. La información adicional del perfil no está
            disponible temporalmente.
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/fidelidad" className="btn-primary">
            Mi tarjeta de fidelidad
          </Link>
          <Link href="/catalogo" className="btn-primary">
            Explorar catálogo
          </Link>
          <Link href="/promociones" className="btn-secondary">
            Ver promociones
          </Link>
          {user.app_metadata.role === "admin" && (
            <Link href="/administracion" className="btn-secondary">
              Administrar farmacia
            </Link>
          )}
        </div>
        <div className="mt-8 border-t border-slate-200 pt-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
