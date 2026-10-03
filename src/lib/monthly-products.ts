import type { Product } from "./catalog";
import type { Campaign } from "./campaigns";

// Selección enviada por el propietario para octubre de 2026, en UTC-06:00.
export const monthlyProducts: Product[] = [
  {
    slug: "proteina-arveja-bcaa",
    name: "Proteína de arveja + BCAA",
    brand: "Raven Nutrition Care",
    category_slug: "nutricion",
    description:
      "Conoce la campaña de proteína de arveja + BCAA de Raven Nutrition Care. Consulta las presentaciones, condiciones y disponibilidad en sucursal.",
    presentation: "Polvo · presentación por confirmar en sucursal",
    requires_prescription: null,
    featured: false,
    bestseller_rank: null,
    promotional: true,
    promotion_label: "Selección del mes",
    image_path: "/images/proteina-bcaa-farmacova.webp",
    promotion_starts_at: "2026-10-01T06:00:00Z",
    promotion_ends_at: "2026-11-01T06:00:00Z",
  },
  {
    slug: "enerpax",
    name: "Enerpax",
    brand: "Raven Nutrition Care",
    category_slug: "nutricion",
    description:
      "Descubre la campaña de Enerpax y sus sabores chocolate, fresa y naranja. Confirma las presentaciones y disponibilidad con tu sucursal Farmacova.",
    presentation: "Bebida fortificada en polvo · sabores según el anuncio",
    requires_prescription: null,
    featured: false,
    bestseller_rank: null,
    promotional: true,
    promotion_label: "Selección del mes",
    image_path: "/images/enerpax-farmacova.webp",
    promotion_starts_at: "2026-10-01T06:00:00Z",
    promotion_ends_at: "2026-11-01T06:00:00Z",
  },
  {
    slug: "fexofen",
    name: "Fexofén",
    brand: "Laboratorios Raven",
    category_slug: "respiratorio",
    description:
      "Conoce la campaña de la línea Fexofén. Las presentaciones, requisitos de dispensación y disponibilidad se confirman con el equipo farmacéutico en sucursal.",
    presentation: "Línea de presentaciones según el anuncio",
    requires_prescription: null,
    featured: false,
    bestseller_rank: null,
    promotional: true,
    promotion_label: "Selección del mes",
    image_path: "/images/fexofen-farmacova.webp",
    promotion_starts_at: "2026-10-01T06:00:00Z",
    promotion_ends_at: "2026-11-01T06:00:00Z",
  },
];

export const monthlyCampaigns: Campaign[] = monthlyProducts.map(
  (product, i) => ({
    id: `fc000000-0000-4000-8000-${String(i + 101).padStart(12, "0")}`,
    title: product.name,
    eyebrow: "Farmacova · Selección del mes",
    description: product.description,
    image_path: product.image_path,
    cta_label: "Ver detalles",
    cta_href: `/catalogo/${product.slug}`,
    sponsored: false,
    sponsor: "",
    position: i + 4,
    active: true,
    starts_at: product.promotion_starts_at!,
    ends_at: product.promotion_ends_at!,
  }),
);
