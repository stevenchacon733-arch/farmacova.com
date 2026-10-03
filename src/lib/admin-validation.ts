export type AdminProduct = {
  id: string;
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
  published: boolean;
  price_crc: number | null;
  sale_price_crc: number | null;
  promotion_starts_at: string | null;
  promotion_ends_at: string | null;
  availability: string;
};
export type AdminBranch = {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  published: boolean;
};
export type AdminSettings = {
  id: number;
  loyalty_enabled: boolean;
  accumulate_remainder: boolean;
  earn_on_redemption: boolean;
  loyalty_terms: string;
  program_version: number;
};
export type Entity = "productos" | "sucursales" | "configuracion";
export type AdminRecord = AdminProduct | AdminBranch | AdminSettings;
function text(value: unknown, label: string, min: number, max: number) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max
  )
    throw new Error(`${label}: escribe entre ${min} y ${max} caracteres.`);
  return value.trim();
}
function bool(value: unknown) {
  if (typeof value !== "boolean") throw new Error("Opción inválida.");
  return value;
}
function price(value: unknown) {
  if (value === null || value === "") return null;
  const amount = Number(value);
  if (
    !Number.isFinite(amount) ||
    amount <= 0 ||
    amount > 1_000_000 ||
    Math.abs(amount * 100 - Math.round(amount * 100)) > 0.000001
  )
    throw new Error(
      "Precio inválido: usa hasta dos decimales y un máximo de ₡1.000.000.",
    );
  return amount;
}
export function validateRecord(
  entity: Entity,
  input: unknown,
  storageUrl?: string,
): AdminRecord {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("Formulario inválido.");
  const row = input as Record<string, unknown>;
  if (entity === "configuracion")
    return {
      id: 1,
      loyalty_enabled: bool(row.loyalty_enabled),
      accumulate_remainder: bool(row.accumulate_remainder),
      earn_on_redemption: bool(row.earn_on_redemption),
      loyalty_terms: text(row.loyalty_terms, "Condiciones", 0, 3000),
      program_version: 1,
    };
  const id = text(row.id, "Identificador", 36, 36);
  if (!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id))
    throw new Error("Identificador inválido.");
  if (entity === "sucursales") {
    const phone = text(row.phone, "Teléfono", 0, 24);
    if (!/^\+?[0-9 ()-]*$/.test(phone)) throw new Error("Teléfono inválido.");
    return {
      id,
      name: text(row.name, "Nombre", 2, 120),
      address: text(row.address, "Dirección", 2, 500),
      phone,
      hours: text(row.hours, "Horario", 0, 500),
      published: bool(row.published),
    };
  }
  if (entity !== "productos") throw new Error("Sección inválida.");
  const slug = text(row.slug, "Enlace", 2, 100);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))
    throw new Error(
      "El enlace solo admite letras minúsculas, números y guiones.",
    );
  const category = text(row.category_slug, "Categoría", 1, 30);
  if (
    !["dolor", "respiratorio", "digestivo", "prescripcion"].includes(category)
  )
    throw new Error("Categoría inválida.");
  const base = price(row.price_crc),
    sale = price(row.sale_price_crc);
  const date = (value: unknown) => {
    if (!value) return null;
    if (
      typeof value !== "string" ||
      value.length > 40 ||
      !Number.isFinite(Date.parse(value))
    )
      throw new Error("Fecha inválida.");
    // datetime-local no incluye zona; el horario de la farmacia es UTC-06:00.
    const zoned = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/.test(value)
      ? `${value}-06:00`
      : value;
    return new Date(zoned).toISOString();
  };
  const starts = date(row.promotion_starts_at),
    ends = date(row.promotion_ends_at);
  if (
    sale !== null &&
    (base === null ||
      sale >= base ||
      !starts ||
      !ends ||
      Date.parse(ends) <= Date.parse(starts))
  )
    throw new Error(
      "La oferta necesita un precio menor al regular y fechas válidas.",
    );
  const rank =
    row.bestseller_rank === null || row.bestseller_rank === ""
      ? null
      : Number(row.bestseller_rank);
  if (rank !== null && (!Number.isInteger(rank) || rank < 1 || rank > 999))
    throw new Error("El orden de más vendidos debe ser de 1 a 999.");
  const prescription = row.requires_prescription;
  if (prescription !== null && typeof prescription !== "boolean")
    throw new Error("Requisito de receta inválido.");
  const availability = text(row.availability, "Disponibilidad", 1, 20);
  if (!["confirmar", "disponible", "agotado"].includes(availability))
    throw new Error("Disponibilidad inválida.");
  let image: string | null = null;
  if (row.image_path) {
    image = text(row.image_path, "Imagen", 1, 1000);
    const local = /^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(
      image,
    );
    let uploaded = false;
    if (storageUrl) {
      try {
        const url = new URL(image),
          baseUrl = new URL(storageUrl);
        uploaded =
          url.origin === baseUrl.origin &&
          /^\/storage\/v1\/object\/public\/product-images\/[a-f0-9-]+\/[a-f0-9-]+\.(png|jpg|jpeg|webp)$/i.test(
            url.pathname,
          ) &&
          !url.search &&
          !url.hash;
      } catch {}
    }
    if (!local && !uploaded)
      throw new Error("Usa una imagen local o una imagen cargada a Farmacova.");
  }
  return {
    id,
    slug,
    name: text(row.name, "Nombre", 2, 200),
    brand: text(row.brand, "Marca", 0, 120),
    category_slug: category,
    description: text(row.description, "Descripción", 0, 3000),
    presentation: text(row.presentation, "Presentación", 0, 200),
    requires_prescription: prescription,
    featured: bool(row.featured),
    bestseller_rank: rank,
    promotional: bool(row.promotional),
    promotion_label: row.promotion_label
      ? text(row.promotion_label, "Etiqueta", 0, 120)
      : null,
    image_path: image,
    published: bool(row.published),
    price_crc: base,
    sale_price_crc: sale,
    promotion_starts_at: starts,
    promotion_ends_at: ends,
    availability,
  };
}
