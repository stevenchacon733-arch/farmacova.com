import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Reward } from "./loyalty";
const fields = "id,member_id,cycle,created_at,redeemed_at,redemption_receipt";
export async function getRewards(
  client: SupabaseClient,
  memberIds: string[],
): Promise<Reward[]> {
  const pending: Reward[] = [];
  // Los cupones antiguos sin canjear no desaparecen al superar el límite de la API.
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client
      .from("loyalty_rewards")
      .select(fields)
      .in("member_id", memberIds)
      .is("redeemed_at", null)
      .order("id")
      .range(offset, offset + 999);
    if (error) throw new Error("No pudimos cargar los cupones disponibles.");
    pending.push(...(data ?? []));
    if (!data || data.length < 1000) break;
  }
  const { data, error } = await client
    .from("loyalty_rewards")
    .select(fields)
    .in("member_id", memberIds)
    .not("redeemed_at", "is", null)
    .order("redeemed_at", { ascending: false })
    .limit(100);
  if (error) throw new Error("No pudimos cargar los canjes recientes.");
  return [...pending, ...(data ?? [])];
}
