import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/catalog";
import { requireVerifiedUser } from "@/lib/auth-server";

export const requireAdmin = cache(async () => {
  if (isDemoMode()) return null;
  const { client, user, aal } = await requireVerifiedUser(
    "/administracion",
    "/auth?next=/administracion",
  );
  if (user.app_metadata?.role !== "admin") redirect("/cuenta");
  // La base de datos exige lo mismo (is_farmacova_admin pide aal2).
  if (aal !== "aal2") redirect("/cuenta/seguridad?requerido=admin");
  return client;
});
export type StoreSettings = {
  id: number;
  loyalty_enabled: boolean;
  accumulate_remainder: boolean;
  earn_on_redemption: boolean;
  loyalty_terms: string;
  program_version: number;
};
export const defaultSettings: StoreSettings = {
  id: 1,
  loyalty_enabled: true,
  accumulate_remainder: true,
  earn_on_redemption: true,
  loyalty_terms: "",
  program_version: 1,
};
export type { Branch } from "./branches";
export async function getSettings(): Promise<StoreSettings> {
  if (isDemoMode()) return defaultSettings;
  const client = await createClient();
  const { data, error } = await client
    .from("store_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error)
    throw new Error(
      "No pudimos cargar las condiciones del programa. Intenta nuevamente.",
    );
  return data;
}
