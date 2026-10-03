"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/catalog";
export async function enrollLoyalty(
  name: string,
  version: number,
  accepted: boolean,
): Promise<{ error?: string }> {
  if (isDemoMode())
    return { error: "La inscripción real requiere conectar Supabase." };
  if (
    typeof name !== "string" ||
    name.trim().length < 2 ||
    name.trim().length > 100 ||
    accepted !== true ||
    !Number.isSafeInteger(version)
  )
    return { error: "Ingresa tu nombre y acepta las condiciones." };
  const client = await createClient();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user?.email_confirmed_at)
    return {
      error: "Inicia sesión y confirma tu correo para crear la tarjeta.",
    };
  const { error } = await client.rpc("enroll_loyalty", {
    p_name: name.trim(),
    p_version: version,
    p_accepted: accepted,
  });
  if (error)
    return {
      error: error.message.includes("TERMS_CHANGED")
        ? "Las condiciones cambiaron. Recarga la página y revísalas antes de continuar."
        : "No pudimos inscribirte. Revisa si el programa está activo e intenta nuevamente.",
    };
  revalidatePath("/fidelidad");
  revalidatePath("/administracion/clientes");
  return {};
}
