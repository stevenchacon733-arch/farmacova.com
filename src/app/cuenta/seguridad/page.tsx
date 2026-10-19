import Link from "next/link";
import type { Metadata } from "next";
import { requireVerifiedUser } from "@/lib/auth-server";
import { MfaManager } from "@/components/auth/mfa";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Seguridad de la cuenta",
  robots: { index: false, follow: false },
};

export default async function AccountSecurityPage({
  searchParams,
}: {
  searchParams: Promise<{ requerido?: string }>;
}) {
  const { user } = await requireVerifiedUser("/cuenta/seguridad");
  const adminRequired =
    (await searchParams).requerido === "admin" &&
    user.app_metadata?.role === "admin";
  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <Link
            href="/cuenta"
            className="text-sm font-semibold text-blue-800 underline underline-offset-4"
          >
            Volver a mi perfil
          </Link>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-blue-950">
            Seguridad de la cuenta
          </h1>
          <p className="mt-3 break-all text-slate-600">{user.email}</p>
        </div>
        {adminRequired && (
          <p
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900"
          >
            Para entrar a la administración necesitas activar la verificación en
            dos pasos. Así, aunque alguien adivine tu contraseña, no podrá
            cambiar precios ni puntos.
          </p>
        )}
        <section className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-blue-950">
            Verificación en dos pasos
          </h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-slate-600">
            Además de tu contraseña, te pediremos un código de tu celular al
            ingresar.
          </p>
          <MfaManager />
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-xl font-bold text-blue-950">Contraseña</h2>
          <p className="mb-6 mt-2 text-sm leading-relaxed text-slate-600">
            Usa una contraseña que no uses en otros sitios.
          </p>
          <Link href="/auth/actualizar-clave" className="btn-secondary">
            Cambiar contraseña
          </Link>
        </section>
      </div>
    </div>
  );
}
