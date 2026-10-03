import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./supabase/config";
import { normalizeSearch } from "./validation";

export type Category = {
  slug: string;
  name: string;
  description: string;
  icon: string;
};
export type Product = {
  slug: string;
  name: string;
  brand: string;
  category_slug: string;
  description: string;
  presentation: string;
  requires_prescription: boolean | null;
  featured: boolean;
  bestseller_rank: number | null;
  promotional: boolean;
  promotion_label: string | null;
  image_path: string | null;
  price_crc?: number | null;
  sale_price_crc?: number | null;
  promotion_starts_at?: string | null;
  promotion_ends_at?: string | null;
  availability?: string;
};
export type SponsoredAd = {
  sponsor: string;
  product: string;
  headline: string;
  description: string;
  image_path: string | null;
};
export type Collection =
  "todos" | "mas-vendidos" | "destacados" | "promociones";

export const categories: Category[] = [
  {
    slug: "dolor",
    name: "Dolor y fiebre",
    description: "Explora medicamentos de esta categoría",
    icon: "pill",
  },
  {
    slug: "respiratorio",
    name: "Salud respiratoria",
    description: "Encuentra opciones en nuestro catálogo",
    icon: "wind",
  },
  {
    slug: "digestivo",
    name: "Salud digestiva",
    description: "Conoce las presentaciones disponibles",
    icon: "heart",
  },
  {
    slug: "prescripcion",
    name: "Con receta",
    description: "Medicamentos sujetos a prescripción",
    icon: "clipboard",
  },
];

// Solo ejemplos de catálogo: no representan inventario, precios ni ventas reales.
export const demoProducts: Product[] = [
  {
    slug: "tioflex",
    name: "Tioflex",
    brand: "Laboratorios Raven",
    category_slug: "dolor",
    description:
      "Conoce Tioflex y la campaña de Laboratorios Raven. La presentación, condiciones de venta y disponibilidad se confirman en sucursal.",
    presentation: "Vía oral · 10 mL, según el anuncio",
    requires_prescription: null,
    featured: true,
    bestseller_rank: 1,
    promotional: true,
    promotion_label: "Campaña Raven",
    image_path: "/images/tioflex-raven.png",
  },
  {
    slug: "acetaminofen",
    name: "Acetaminofén",
    brand: "Medicamentos",
    category_slug: "dolor",
    description:
      "Ficha de ejemplo para el catálogo de medicamentos. Confirma la marca, presentación y disponibilidad directamente en sucursal.",
    presentation: "Presentación por confirmar",
    requires_prescription: null,
    featured: true,
    bestseller_rank: 2,
    promotional: false,
    promotion_label: null,
    image_path: null,
  },
  {
    slug: "loratadina",
    name: "Loratadina",
    brand: "Medicamentos",
    category_slug: "respiratorio",
    description:
      "Ficha de ejemplo para el catálogo. Las marcas, presentaciones y condiciones de venta deben ser confirmadas por Farmacova.",
    presentation: "Presentación por confirmar",
    requires_prescription: null,
    featured: true,
    bestseller_rank: 3,
    promotional: false,
    promotion_label: null,
    image_path: null,
  },
  {
    slug: "omeprazol",
    name: "Omeprazol",
    brand: "Medicamentos",
    category_slug: "digestivo",
    description:
      "Ficha de ejemplo de medicamento. Confirma la presentación y los requisitos de dispensación con la sucursal.",
    presentation: "Presentación por confirmar",
    requires_prescription: null,
    featured: true,
    bestseller_rank: 4,
    promotional: false,
    promotion_label: null,
    image_path: null,
  },
  {
    slug: "medicamentos-receta",
    name: "Medicamentos con receta",
    brand: "Farmacova",
    category_slug: "prescripcion",
    description:
      "Presenta tu receta en sucursal para confirmar los medicamentos y presentaciones disponibles.",
    presentation: "Dispensación en sucursal",
    requires_prescription: null,
    featured: false,
    bestseller_rank: null,
    promotional: false,
    promotion_label: null,
    image_path: null,
  },
];

export const defaultAd: SponsoredAd = {
  sponsor: "Laboratorios Raven",
  product: "Tioflex",
  headline: "Vuelve a tu ritmo sin dolor",
  description:
    "Campaña de Tioflex de Laboratorios Raven. Consulta condiciones y disponibilidad en sucursal.",
  image_path: "/images/tioflex-raven.png",
};

export function isDemoMode() {
  return process.env.FARMACOVA_DEMO_MODE === "true";
}
export function localImagePath(value: string | null): string | null {
  if (!value) return null;
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(value))
    return value;
  try {
    const url = new URL(value);
    const base = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "");
    return url.origin === base.origin &&
      /^\/storage\/v1\/object\/public\/product-images\/[a-f0-9-]+\/[a-f0-9-]+\.(png|jpg|jpeg|webp)$/i.test(
        url.pathname,
      ) &&
      !url.search &&
      !url.hash
      ? value
      : null;
  } catch {
    return null;
  }
}
function publicClient() {
  const { url, key } = getSupabaseConfig();
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
const productFields =
  "slug,name,brand,category_slug,description,presentation,requires_prescription,featured,bestseller_rank,promotional,promotion_label,image_path,price_crc,sale_price_crc,promotion_starts_at,promotion_ends_at,availability";
export const pageSize = 12;

function inCollection(product: Product, collection: Collection) {
  if (collection === "mas-vendidos") return product.bestseller_rank !== null;
  if (collection === "destacados") return product.featured;
  if (collection === "promociones") return product.promotional;
  return true;
}

export async function getCollectionProducts(
  collection: Collection,
): Promise<Product[]> {
  return (await searchProducts("", "", 1, collection)).products.slice(0, 4);
}

export async function searchProducts(
  query = "",
  category = "",
  page = 1,
  collection: Collection = "todos",
): Promise<{ products: Product[]; total: number }> {
  const offset = (page - 1) * pageSize;
  if (isDemoMode()) {
    const matches = filterProducts(demoProducts, query, category).filter(
      (product) => inCollection(product, collection),
    );
    if (collection === "mas-vendidos")
      matches.sort(
        (a, b) => (a.bestseller_rank ?? 999) - (b.bestseller_rank ?? 999),
      );
    return {
      products: matches.slice(offset, offset + pageSize),
      total: matches.length,
    };
  }
  let request = publicClient()
    .from("products")
    .select(productFields, { count: "exact" })
    .eq("published", true)
    .in(
      "category_slug",
      categories.map((item) => item.slug),
    );
  if (category) request = request.eq("category_slug", category);
  if (query)
    request = request.textSearch("search_document", query, {
      config: "spanish",
      type: "plain",
    });
  if (collection === "mas-vendidos")
    request = request
      .not("bestseller_rank", "is", null)
      .order("bestseller_rank");
  if (collection === "destacados") request = request.eq("featured", true);
  if (collection === "promociones") request = request.eq("promotional", true);
  const { data, count, error } = await request
    .order("name")
    .order("slug")
    .range(offset, offset + pageSize - 1);
  if (error) throw new Error("El catálogo no está disponible en este momento.");
  return { products: data ?? [], total: count ?? 0 };
}

export async function getProduct(slug: string): Promise<Product | null> {
  if (isDemoMode())
    return demoProducts.find((product) => product.slug === slug) ?? null;
  const { data, error } = await publicClient()
    .from("products")
    .select(productFields)
    .eq("slug", slug)
    .eq("published", true)
    .in(
      "category_slug",
      categories.map((item) => item.slug),
    )
    .maybeSingle();
  if (error) throw new Error("No pudimos cargar la información del producto.");
  return data;
}

export async function getSponsoredAd(): Promise<SponsoredAd> {
  if (isDemoMode()) return defaultAd;
  const { data, error } = await publicClient()
    .from("sponsored_ads")
    .select("sponsor,product,headline,description,image_path")
    .eq("active", true)
    .lte("starts_at", new Date().toISOString())
    .gt("ends_at", new Date().toISOString())
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  // Mantener el anuncio entregado por el usuario como campaña inicial.
  return error || !data ? defaultAd : data;
}

export function filterProducts(products: Product[], query = "", category = "") {
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  return products.filter((product) => {
    const categoryName =
      categories.find((item) => item.slug === product.category_slug)?.name ??
      "";
    const text = normalizeSearch(
      [
        product.name,
        product.brand,
        product.description,
        product.presentation,
        categoryName,
      ].join(" "),
    );
    return (
      (!category || product.category_slug === category) &&
      words.every((word) => text.includes(word))
    );
  });
}
