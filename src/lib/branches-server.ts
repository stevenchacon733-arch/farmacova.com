import "server-only";
import { unstable_cache } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/catalog";
import { hasSupabaseConfig, getSupabaseConfig } from "@/lib/supabase/config";
import { initialBranches, type Branch } from "@/lib/branches";

// Lectura pública sin cookies: así el botón de WhatsApp del layout no vuelve
// dinámicas las páginas que no lo son.
const publishedBranches = unstable_cache(
  async (): Promise<Branch[]> => {
    const { url, key } = getSupabaseConfig();
    const client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from("branches")
      .select("*")
      .eq("published", true)
      .order("name");
    if (error) throw new Error("No pudimos cargar las sucursales.");
    return data ?? [];
  },
  ["published-branches"],
  { revalidate: 300 },
);

export async function getPublishedBranches(): Promise<Branch[]> {
  if (isDemoMode()) return initialBranches;
  if (!hasSupabaseConfig()) return [];
  try {
    return await publishedBranches();
  } catch {
    return [];
  }
}
