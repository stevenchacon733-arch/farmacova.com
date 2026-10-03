import Link from "next/link";
import type { Metadata } from "next";
import { searchProducts, pageSize, isDemoMode } from "@/lib/catalog";
import { PromotionCard } from "@/components/catalog/promotion-card";

export const metadata: Metadata = { title: "Promociones del mes" };
export const dynamic = "force-dynamic";

export default async function PromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const parsedPage = Number(params.pagina);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= 10000
      ? parsedPage
      : 1;
  const { products, total } = await searchProducts(
    query,
    "",
    page,
    "promociones",
  );
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (value: number) =>
    `/promociones?${new URLSearchParams({ q: query, pagina: String(value) })}`;
  return (
    <div className="shell py-12">
      <span className="eyebrow">Una selección para ti</span>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-blue-950">
        Promociones del mes
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
        Conoce los productos seleccionados por Farmacova este mes. Las
        condiciones y la disponibilidad se confirman en sucursal.
      </p>
      {query && (
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <p className="text-slate-600">
            {total} resultados para “{query}”
          </p>
          <Link
            href="/promociones"
            className="font-semibold text-blue-800 underline"
          >
            Ver todas las promociones
          </Link>
        </div>
      )}
      {isDemoMode() && (
        <p className="mt-6 text-xs text-slate-500">
          Vista de ejemplo. Los productos y precios del mes se publican desde el
          panel de administración.
        </p>
      )}
      {products.length ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <PromotionCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl bg-slate-50 p-8 text-slate-600">
          {query ? (
            <p>
              No encontramos promociones con ese nombre. Prueba otra búsqueda.
            </p>
          ) : (
            <p>
              Estamos preparando nuevas promociones. Vuelve pronto para conocer
              los productos del mes.
            </p>
          )}
        </div>
      )}
      {pages > 1 && (
        <nav
          aria-label="Páginas de promociones"
          className="mt-8 flex items-center justify-center gap-4"
        >
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="btn-secondary">
              Anterior
            </Link>
          )}
          <span className="text-sm text-slate-500">
            Página {page} de {pages}
          </span>
          {page < pages && (
            <Link href={pageHref(page + 1)} className="btn-secondary">
              Siguiente
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
