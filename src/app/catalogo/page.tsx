import { redirect } from "next/navigation";

// Mantener enlaces antiguos sin volver a mostrar un catálogo general.
export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim().slice(0, 120) : "";
  redirect(
    query
      ? `/promociones?${new URLSearchParams({ q: query })}`
      : "/promociones",
  );
}
