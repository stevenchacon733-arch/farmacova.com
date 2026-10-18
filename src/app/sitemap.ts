import type { MetadataRoute } from "next";
import { searchProducts } from "@/lib/catalog";
import { siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/promociones`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/sucursales`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/servicios`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
  try {
    const { products } = await searchProducts("", "", 1, "promociones");
    for (const product of products)
      pages.push({
        url: `${base}/catalogo/${product.slug}`,
        changeFrequency: "weekly",
        priority: 0.6,
      });
  } catch {
    // Sin catálogo disponible, el sitemap conserva las páginas fijas.
  }
  return pages;
}
