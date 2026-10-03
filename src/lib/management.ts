import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/catalog";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export const requireAdmin = cache(async () => {
  if (isDemoMode()) return null;
  if (!hasSupabaseConfig()) redirect("/auth?next=/administracion");
  const client = await createClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user?.email_confirmed_at)
    redirect("/auth?next=/administracion");
  if (user.app_metadata?.role !== "admin") redirect("/cuenta");
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
export type Branch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  published: boolean;
};
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
