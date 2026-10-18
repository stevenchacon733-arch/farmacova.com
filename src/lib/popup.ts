// Pop-up publicitario de la portada: tipo, validación y vista previa local.
export type PopupAd = {
  id: string;
  sponsor: string;
  product: string;
  headline: string;
  description: string;
  image_path: string | null;
  active: boolean;
  starts_at: string;
  ends_at: string;
};

export const popupStorageKey = "farmacova-preview-popup-v1";
const popupBucket = "/storage/v1/object/public/campaign-images/";

export const demoPopup: PopupAd = {
  id: "fc000000-0000-4000-8000-000000000201",
  sponsor: "Fast&Up",
  product: "Fast&Up Vitamina C + D3 + Zinc",
  headline: "Tabletas efervescentes sabor naranja",
  description:
    "Campaña de Fast&Up. Consulta condiciones y disponibilidad en sucursal.",
  image_path: "/images/fast-up-vitamina-c-d3-zinc.jpeg",
  active: true,
  starts_at: "2026-01-01T00:00:00Z",
  ends_at: "2099-01-01T00:00:00Z",
};

// Imágenes locales, del bucket público de Supabase o (solo en la demo) data URLs.
export function safePopupImage(
  path: string | null | undefined,
  supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
  allowData = false,
): string | null {
  if (!path) return null;
  if (/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(path))
    return path;
  if (
    allowData &&
    /^data:image\/(png|jpeg|webp);base64,[a-zA-Z0-9+/=]+$/.test(path)
  )
    return path;
  if (!supabaseUrl) return null;
  try {
    const url = new URL(path);
    const base = new URL(supabaseUrl);
    return url.origin === base.origin &&
      url.pathname.startsWith(popupBucket) &&
      /\.(png|jpg|jpeg|webp)$/i.test(url.pathname) &&
      !url.search &&
      !url.hash
      ? path
      : null;
  } catch {
    return null;
  }
}

function between(value: string, min: number, max: number) {
  const length = value.trim().length;
  return length >= min && length <= max;
}

export function validatePopup(ad: PopupAd): string | null {
  if (!between(ad.sponsor, 2, 120))
    return "Escribe el patrocinador (2 a 120 caracteres).";
  if (!between(ad.product, 2, 120))
    return "Escribe el producto (2 a 120 caracteres).";
  if (!between(ad.headline, 2, 200))
    return "Escribe un titular (2 a 200 caracteres).";
  if (!between(ad.description, 2, 1000))
    return "Escribe una descripción (2 a 1000 caracteres).";
  const starts = Date.parse(ad.starts_at);
  const ends = Date.parse(ad.ends_at);
  if (!Number.isFinite(starts) || !Number.isFinite(ends))
    return "Indica las fechas de inicio y fin.";
  if (ends <= starts) return "La fecha de fin debe ser posterior al inicio.";
  if (ad.active && !ad.image_path)
    return "Sube una imagen antes de publicar el pop-up.";
  return null;
}

// El pop-up vigente: activo, dentro de fechas, el que empezó más recientemente.
export function currentPopup(ads: PopupAd[], now = Date.now()): PopupAd | null {
  return (
    ads
      .filter(
        (ad) =>
          ad.active &&
          Date.parse(ad.starts_at) <= now &&
          Date.parse(ad.ends_at) > now,
      )
      .sort((a, b) => Date.parse(b.starts_at) - Date.parse(a.starts_at))[0] ??
    null
  );
}

export function parsePreviewPopups(
  value: string | null,
  fallback: PopupAd[],
): PopupAd[] {
  if (!value) return fallback;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed) || parsed.length > 20) return fallback;
    const items = parsed.filter(
      (item): item is PopupAd =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "string" &&
        validatePopup(item as PopupAd) === null,
    );
    return items.length ? items : fallback;
  } catch {
    return fallback;
  }
}
