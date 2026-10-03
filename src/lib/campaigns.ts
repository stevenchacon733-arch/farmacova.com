export type Campaign = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  image_path: string | null;
  cta_label: string;
  cta_href: string;
  sponsored: boolean;
  sponsor: string;
  position: number;
  active: boolean;
  starts_at: string;
  ends_at: string;
};
export const campaignStorageKey = "farmacova-preview-campaigns-v1";
export const demoCampaigns: Campaign[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    title: "Vuelve a tu ritmo.\nSigue adelante.",
    eyebrow: "Tioflex · Laboratorios Raven",
    description:
      "Conoce la campaña de Tioflex y confirma su disponibilidad en tu sucursal Farmacova.",
    image_path: "/images/tioflex-raven.png",
    cta_label: "Conocer Tioflex",
    cta_href: "/catalogo/tioflex",
    sponsored: true,
    sponsor: "Laboratorios Raven",
    position: 1,
    active: true,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2099-01-01T00:00:00Z",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    title: "Productos del mes.\nElegidos para ti.",
    eyebrow: "Promociones del mes",
    description:
      "Conoce los productos seleccionados este mes y confirma las condiciones de las promociones en sucursal.",
    image_path: null,
    cta_label: "Ver promociones del mes",
    cta_href: "/promociones",
    sponsored: false,
    sponsor: "",
    position: 2,
    active: true,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2099-01-01T00:00:00Z",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    title: "Dale un vistazo\na nuestras campañas.",
    eyebrow: "Promociones Farmacova",
    description:
      "Descubre productos destacados y campañas de nuestros laboratorios. Condiciones y disponibilidad en sucursal.",
    image_path: "/images/tioflex-raven.png",
    cta_label: "Ver promociones",
    cta_href: "/promociones",
    sponsored: false,
    sponsor: "",
    position: 3,
    active: true,
    starts_at: "2026-01-01T00:00:00Z",
    ends_at: "2099-01-01T00:00:00Z",
  },
];

export function safeCampaignHref(value: string): boolean {
  return (
    /^\/(catalogo|promociones|servicios|sucursales|fidelidad)(\/|\?|$)/.test(
      value,
    ) && !/[\s\\]/.test(value)
  );
}
export function activeCampaigns(
  items: Campaign[],
  now = Date.now(),
): Campaign[] {
  return items
    .filter(
      (item) =>
        item.active &&
        Date.parse(item.starts_at) <= now &&
        Date.parse(item.ends_at) > now,
    )
    .sort((a, b) => a.position - b.position);
}
export function parsePreviewCampaigns(
  raw: string | null,
  fallback: Campaign[],
): Campaign[] {
  if (!raw) return fallback;
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value) || value.length > 50) return fallback;
    const valid = value.every(
      (item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        item.title.length <= 120 &&
        typeof item.eyebrow === "string" &&
        typeof item.description === "string" &&
        typeof item.cta_label === "string" &&
        typeof item.cta_href === "string" &&
        safeCampaignHref(item.cta_href) &&
        typeof item.sponsored === "boolean" &&
        typeof item.sponsor === "string" &&
        typeof item.active === "boolean" &&
        Number.isSafeInteger(item.position) &&
        typeof item.starts_at === "string" &&
        typeof item.ends_at === "string" &&
        (item.image_path === null || typeof item.image_path === "string"),
    );
    return valid ? (value as Campaign[]) : fallback;
  } catch {
    return fallback;
  }
}
export function validateCampaign(item: Campaign): string | null {
  if (!item.title.trim() || item.title.length > 120)
    return "Escribe un título de hasta 120 caracteres.";
  if (item.eyebrow.length > 100 || item.description.length > 500)
    return "El subtítulo admite 100 caracteres y la descripción, 500.";
  if (
    !item.cta_label.trim() ||
    item.cta_label.length > 60 ||
    !safeCampaignHref(item.cta_href)
  )
    return "Agrega un botón y una ruta interna válida del catálogo, promociones, servicios, sucursales o fidelidad.";
  if (item.sponsored && !item.sponsor.trim())
    return "Indica el laboratorio o patrocinador.";
  if (
    !Number.isSafeInteger(item.position) ||
    item.position < 1 ||
    item.position > 999
  )
    return "El orden debe ser un número entre 1 y 999.";
  if (
    !Number.isFinite(Date.parse(item.starts_at)) ||
    !Number.isFinite(Date.parse(item.ends_at)) ||
    Date.parse(item.ends_at) <= Date.parse(item.starts_at)
  )
    return "La fecha de fin debe ser posterior a la fecha de inicio.";
  return null;
}
