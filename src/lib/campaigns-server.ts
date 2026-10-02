import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabase/config";
import { isDemoMode } from "./catalog";
import { activeCampaigns, demoCampaigns, type Campaign } from "./campaigns";

export async function getCampaigns(): Promise<Campaign[]> {
  if (isDemoMode()) return activeCampaigns(demoCampaigns);
  const { url, key } = getSupabaseConfig();
  const client = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await client
    .from("hero_campaigns")
    .select(
      "id,title,eyebrow,description,image_path,cta_label,cta_href,sponsored,sponsor,position,active,starts_at,ends_at",
    )
    .eq("active", true)
    .lte("starts_at", new Date().toISOString())
    .gt("ends_at", new Date().toISOString())
    .order("position")
    .limit(50);
  if (error) throw new Error("No pudimos cargar las campañas.");
  return data ?? [];
}
