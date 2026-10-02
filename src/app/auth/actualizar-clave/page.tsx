import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { AuthForm } from "@/components/auth/auth-form";

export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  if (!hasSupabaseConfig()) redirect("/auth?mode=recuperar");
  const { data, error } = await (await createClient()).auth.getUser();
  if (error || !data.user) redirect("/auth?error=enlace&mode=recuperar");
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
