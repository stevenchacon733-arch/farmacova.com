import Link from "next/link";
import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { AuthForm, type AuthMode } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Tu cuenta",
  robots: { index: false, follow: true },
};

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string; confirmado?: string }>;
}) {
  const params = await searchParams;
  const mode: AuthMode =
    params.mode === "registro"
      ? "registro"
      : params.mode === "recuperar"
        ? "recuperar"
        : "ingreso";
  const title =
    mode === "registro"
      ? "Tu cuidado empieza aquí."
      : mode === "recuperar"
        ? "Recupera tu acceso."
        : "Qué bueno tenerte aquí.";
  const initialMessage = params.error
    ? "El enlace no es válido o expiró. Inténtalo de nuevo o solicita un nuevo enlace."
    : params.confirmado
      ? "Tu correo está confirmado. Ya puedes ingresar."
      : "";
  return (
    <div className="shell grid gap-12 py-12 lg:grid-cols-2 lg:gap-24">
      <div className="self-start rounded-3xl bg-blue-950 p-9 text-white lg:sticky lg:top-8">
        <ShieldCheck size={42} className="text-green-400" aria-hidden="true" />
        <h1 className="mt-7 text-4xl font-extrabold tracking-tight">{title}</h1>
        <p className="mt-5 max-w-md leading-relaxed text-blue-100">
          Únete a Farmacova para crear tu perfil de cliente frecuente.
        </p>
        <p className="mt-8 border-t border-white/15 pt-6 text-sm leading-relaxed text-blue-200">
          Registrarte es opcional. Puedes explorar medicamentos y promociones
          sin crear una cuenta.
        </p>
        <Link
          href="/catalogo"
          className="mt-6 inline-block text-sm font-semibold text-green-300 underline underline-offset-4"
        >
          Continuar al catálogo
        </Link>
      </div>
      <div className="mx-auto w-full max-w-md">
        <div className="mb-8 flex rounded-full bg-slate-100 p-1">
          <Link
            href="/auth"
            className={`flex-1 rounded-full py-3 text-center text-sm font-semibold ${mode === "ingreso" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500"}`}
          >
            Ingresar
          </Link>
          <Link
            href="/auth?mode=registro"
            className={`flex-1 rounded-full py-3 text-center text-sm font-semibold ${mode === "registro" ? "bg-white text-blue-900 shadow-sm" : "text-slate-500"}`}
          >
            Crear perfil
          </Link>
        </div>
        <h2 className="mb-6 text-2xl font-bold text-blue-950">
          {mode === "recuperar"
            ? "Te enviaremos un enlace"
            : mode === "registro"
              ? "Crea tu cuenta"
              : "Ingresa a tu perfil"}
        </h2>
        <AuthForm key={mode} mode={mode} initialMessage={initialMessage} />
      </div>
    </div>
  );
}
