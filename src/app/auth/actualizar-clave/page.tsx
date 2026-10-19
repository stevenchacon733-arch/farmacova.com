import { requireVerifiedUser } from "@/lib/auth-server";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  // Con verificación en dos pasos activa, Supabase exige el código antes de
  // cambiar la contraseña, también al llegar desde el correo de recuperación.
  await requireVerifiedUser(
    "/auth/actualizar-clave",
    "/auth?error=enlace&mode=recuperar",
  );
  return (
    <div className="shell py-12">
      <div className="mx-auto max-w-md">
        <h1 className="mb-7 text-3xl font-bold text-blue-950">
          Elige una nueva contraseña
        </h1>
        <AuthForm mode="actualizar" />
      </div>
    </div>
  );
}
