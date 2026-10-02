import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import {
  categories,
  searchProducts,
  pageSize,
  isDemoMode,
  type Collection,
} from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = { title: "Catálogo" };
export const dynamic = "force-dynamic";

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    pagina?: string;
    coleccion?: string;
  }>;
}) {
  const params = await searchParams;
  const query =
    typeof params.q === "string" ? params.q.trim().slice(0, 120) : "";
  const category = categories.some((item) => item.slug === params.categoria)
    ? params.categoria!
    : "";
  const parsedPage = Number(params.pagina);
  const page =
    Number.isSafeInteger(parsedPage) && parsedPage > 0 && parsedPage <= 10000
      ? parsedPage
      : 1;
  const collection: Collection = [
    "mas-vendidos",
    "destacados",
    "promociones",
  ].includes(params.coleccion ?? "")
    ? (params.coleccion as Collection)
    : "todos";
  const titles = {
    todos: "Nuestros medicamentos",
    "mas-vendidos": "Más vendidos",
    destacados: "Productos destacados",
    promociones: "Medicamentos en promoción",
  };
  const { products, total } = await searchProducts(
    query,
    category,
    page,
    collection,
  );
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const pageHref = (value: number) =>
    `/catalogo?${new URLSearchParams({ q: query, categoria: category, pagina: String(value), coleccion: collection })}`;
  return (
    <div className="shell py-12">
      <span className="eyebrow">Bienestar a tu alcance</span>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-blue-950">
        {titles[collection]}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
        Conoce productos, presentaciones y categorías. Consulta la
        disponibilidad con nuestro equipo en sucursal.
      </p>
      <form
        action="/catalogo"
        role="search"
        className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row"
      >
        {collection !== "todos" && (
          <input type="hidden" name="coleccion" value={collection} />
        )}
        <div className="relative flex-1">
          <label htmlFor="catalog-query" className="sr-only">
            Buscar productos, marcas o descripciones
          </label>
          <Search
            size={19}
            className="absolute left-4 top-3.5 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="catalog-query"
            type="search"
            name="q"
            defaultValue={query}
            maxLength={120}
            placeholder="Producto, marca o descripción"
            className="field pl-11"
          />
        </div>
        <label className="sr-only" htmlFor="catalog-category">
          Categoría
        </label>
        <select
          id="catalog-category"
          name="categoria"
          defaultValue={category}
          className="field md:w-64"
        >
          <option value="">Todas las categorías</option>
          {categories.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary">
          Buscar
        </button>
      </form>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {total} {total === 1 ? "producto" : "productos"}
          {query && ` para “${query}”`}
        </p>
        {(query || category || collection !== "todos") && (
          <Link
            href="/catalogo"
            className="text-sm font-semibold text-blue-800 underline"
          >
            Limpiar filtros
          </Link>
        )}
      </div>
      {isDemoMode() && (
        <p className="mt-3 rounded-xl bg-blue-50 p-3 text-xs leading-relaxed text-blue-900">
          Catálogo de ejemplo: los productos, sus marcas y sus presentaciones
          deben confirmarse antes de publicar el catálogo real.
        </p>
      )}
      {products.length ? (
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-7 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h2 className="text-xl font-bold text-blue-950">
            No encontramos productos
          </h2>
          <p className="mt-3 text-slate-500">
            Prueba otro nombre o selecciona una categoría diferente.
          </p>
          <Link href="/catalogo" className="btn-secondary mt-6">
            Ver catálogo completo
          </Link>
        </div>
      )}
      {pages > 1 && (
        <nav
          aria-label="Páginas del catálogo"
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
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
