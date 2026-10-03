import Link from "next/link";
import { requireAdmin, getSettings } from "@/lib/management";
import { CustomerManager } from "@/components/admin/customer-manager";
import type { Member, Reward, Purchase } from "@/lib/loyalty";
import { getRewards } from "@/lib/loyalty-server";
export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const client = await requireAdmin();
  const settings = await getSettings();
  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 100).replace(/[^\p{L}\p{N} -]/gu, "");
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(params.page)) || 1),
  );
  let members: Member[] = [];
  let rewards: Reward[] = [];
  let purchases: Purchase[] = [];
  let total = 0;
  if (client) {
    let request = client
      .from("loyalty_members")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
    if (q)
      request = request.or(
        `display_name.ilike.%${q}%,member_number.ilike.%${q}%`,
      );
    const { data, error, count } = await request.range(
      (page - 1) * 25,
      page * 25 - 1,
    );
    if (error)
      throw new Error(
        "No pudimos cargar los clientes. Aplica las migraciones del programa.",
      );
    members = data ?? [];
    total = count ?? 0;
    if (members.length) {
      const ids = members.map((m) => m.id);
      const results = await Promise.all([
        getRewards(client, ids),
        client
          .from("loyalty_purchases")
          .select("id,member_id,receipt,amount_cents,stamps_added,created_at")
          .in("member_id", ids)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      if (results[1].error)
        throw new Error("No pudimos cargar los movimientos.");
      rewards = results[0];
      purchases = results[1].data ?? [];
    }
  }
  return (
    <>
      <h1 className="text-3xl font-bold text-blue-950">Clientes y cupones</h1>
      <p className="mt-3 text-sm text-slate-500">
        Busca por nombre o pega el código de la tarjeta. Cada ₡10.000 equivale a
        un sello; seis sellos generan un cupón de 15%.
      </p>
      <form className="mt-6 flex flex-wrap gap-3">
        <label className="sr-only" htmlFor="customer-query">
          Buscar cliente por nombre o tarjeta
        </label>
        <input
          className="field max-w-lg"
          id="customer-query"
          name="q"
          maxLength={100}
          placeholder="Nombre o código FC-…"
          defaultValue={q}
        />
        <button className="btn-primary">Buscar cliente</button>
      </form>
      <CustomerManager
        members={members}
        rewards={rewards}
        purchases={purchases}
        demo={!client}
        accumulate={settings.accumulate_remainder}
        earnOnRedemption={settings.earn_on_redemption}
      />
      {total > 25 && (
        <nav aria-label="Páginas de clientes" className="mt-7 flex gap-4">
          {page > 1 && (
            <Link
              className="btn-secondary"
              href={`/administracion/clientes?q=${encodeURIComponent(q)}&page=${page - 1}`}
            >
              Anterior
            </Link>
          )}
          {page * 25 < total && (
            <Link
              className="btn-secondary"
              href={`/administracion/clientes?q=${encodeURIComponent(q)}&page=${page + 1}`}
            >
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
