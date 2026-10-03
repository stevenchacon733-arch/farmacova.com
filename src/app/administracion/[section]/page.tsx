import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin, defaultSettings } from "@/lib/management";
import { demoProducts } from "@/lib/catalog";
import { RecordEditor } from "@/components/admin/record-editor";
import type { AdminRecord, Entity } from "@/lib/admin-validation";
export default async function ManagementPage({
  params,
  searchParams,
}: {
  params: Promise<{ section: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { section } = await params;
  if (!["productos", "sucursales", "configuracion"].includes(section))
    notFound();
  const entity = section as Entity;
  const client = await requireAdmin();
  const filters = await searchParams;
  const q = (filters.q ?? "").slice(0, 100).replace(/[^\p{L}\p{N} -]/gu, "");
  const page = Math.max(
    1,
    Math.min(10000, Math.floor(Number(filters.page)) || 1),
  );
  let total = 0;
  let records: AdminRecord[] = [];
  if (client) {
    const table = {
      productos: "products",
      sucursales: "branches",
      configuracion: "store_settings",
    }[entity];
    let request = client
      .from(table)
      .select(
        entity === "productos"
          ? "id,slug,name,brand,category_slug,description,presentation,requires_prescription,featured,bestseller_rank,promotional,promotion_label,image_path,published,price_crc,sale_price_crc,promotion_starts_at,promotion_ends_at,availability"
          : "*",
        { count: "exact" },
      )
      .order(entity === "configuracion" ? "id" : "name");
    if (entity !== "configuracion") {
      if (q) request = request.ilike("name", `%${q}%`);
      request = request.range((page - 1) * 25, page * 25 - 1);
    }
    const { data, error, count } = await request;
    total = count ?? 0;
    if (error)
      throw new Error(
        "Aplica las migraciones de Farmacova para habilitar esta sección.",
      );
    records = (data ?? []) as unknown as AdminRecord[];
  } else if (entity === "productos")
    records = demoProducts.map((product, i) => ({
      ...product,
      id: `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
      published: true,
      price_crc: null,
      sale_price_crc: null,
      promotion_starts_at: null,
      promotion_ends_at: null,
      availability: "confirmar",
    }));
  else if (entity === "configuracion") records = [defaultSettings];
  return (
    <>
      {client && entity !== "configuracion" && (
        <form className="mb-6 flex flex-wrap gap-3">
          <label htmlFor="record-query" className="sr-only">
            Buscar en todos los registros
          </label>
          <input
            id="record-query"
            name="q"
            className="field max-w-lg"
            placeholder="Buscar en todos los registros por nombre"
            maxLength={100}
            defaultValue={q}
          />
          <button className="btn-secondary">Buscar</button>
        </form>
      )}
      <RecordEditor entity={entity} initial={records} demo={!client} />
      {total > 25 && (
        <nav aria-label="Páginas de registros" className="mt-6 flex gap-3">
          {page > 1 && (
            <Link
              href={`/administracion/${entity}?q=${encodeURIComponent(q)}&page=${page - 1}`}
              className="btn-secondary"
            >
              Anterior
            </Link>
          )}
          {page * 25 < total && (
            <Link
              href={`/administracion/${entity}?q=${encodeURIComponent(q)}&page=${page + 1}`}
              className="btn-secondary"
            >
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
