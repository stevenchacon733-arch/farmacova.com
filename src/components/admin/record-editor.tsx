"use client";
import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Save } from "lucide-react";
import {
  validateRecord,
  type AdminRecord,
  type Entity,
  type AdminProduct,
} from "@/lib/admin-validation";
import { saveAdminRecord } from "@/app/administracion/actions";
import { createClient } from "@/lib/supabase/client";
import { crc } from "@/lib/loyalty";

const names: Record<string, string> = {
  name: "Nombre",
  slug: "Enlace del producto",
  brand: "Marca / laboratorio",
  category_slug: "Categoría",
  description: "Descripción",
  presentation: "Presentación",
  price_crc: "Precio regular (₡)",
  sale_price_crc: "Precio en oferta (₡)",
  promotion_starts_at: "Inicio de oferta · Costa Rica",
  promotion_ends_at: "Fin de oferta · Costa Rica",
  bestseller_rank: "Orden en más vendidos (1–999)",
  promotion_label: "Etiqueta de promoción",
  image_path: "Imagen del producto",
  requires_prescription: "Requisito de receta",
  availability: "Disponibilidad",
  published: "Publicado en la web",
  featured: "Producto destacado",
  promotional: "Mostrar en promociones",
  address: "Dirección",
  phone: "Teléfono",
  secondary_phone: "Segundo teléfono (opcional)",
  maps_url: "Enlace de Google Maps (opcional)",
  waze_url: "Enlace de Waze (opcional)",
  facebook_url: "Facebook de la sucursal (opcional)",
  hours: "Horario",
  loyalty_enabled: "Habilitar inscripciones y acumulación",
  accumulate_remainder: "Acumular compras pequeñas entre facturas",
  earn_on_redemption: "Acumular sellos sobre el importe pagado al canjear",
  loyalty_terms: "Condiciones adicionales del programa",
};
const fields: Record<Entity, string[]> = {
  productos: [
    "name",
    "slug",
    "brand",
    "category_slug",
    "description",
    "presentation",
    "price_crc",
    "sale_price_crc",
    "promotion_starts_at",
    "promotion_ends_at",
    "bestseller_rank",
    "promotion_label",
    "image_path",
    "requires_prescription",
    "availability",
    "published",
    "featured",
    "promotional",
  ],
  sucursales: [
    "name",
    "address",
    "phone",
    "secondary_phone",
    "hours",
    "maps_url",
    "waze_url",
    "facebook_url",
    "published",
  ],
  configuracion: [
    "loyalty_enabled",
    "accumulate_remainder",
    "earn_on_redemption",
    "loyalty_terms",
  ],
};
function blank(entity: Entity): AdminRecord {
  const id = crypto.randomUUID();
  return entity === "sucursales"
    ? {
        id,
        name: "",
        address: "",
        phone: "",
        secondary_phone: "",
        hours: "",
        maps_url: "",
        waze_url: "",
        facebook_url: "",
        published: false,
      }
    : {
        id,
        slug: "",
        name: "",
        brand: "",
        category_slug: "dolor",
        description: "",
        presentation: "",
        price_crc: null,
        sale_price_crc: null,
        promotion_starts_at: null,
        promotion_ends_at: null,
        bestseller_rank: null,
        promotion_label: null,
        image_path: null,
        requires_prescription: null,
        availability: "confirmar",
        published: false,
        featured: false,
        promotional: false,
      };
}
function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("farmacova-admin", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("farmacova-admin", listener);
  };
}
function read(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function parsed(
  value: string | null,
  initial: AdminRecord[],
  entity: Entity,
): AdminRecord[] {
  try {
    const rows = JSON.parse(value ?? "null");
    if (!Array.isArray(rows) || rows.length > 500) return initial;
    return rows.map((row) =>
      validateRecord(entity, row, process.env.NEXT_PUBLIC_SUPABASE_URL),
    );
  } catch {
    return initial;
  }
}
export function RecordEditor({
  entity,
  initial,
  demo,
}: {
  entity: Entity;
  initial: AdminRecord[];
  demo: boolean;
}) {
  const router = useRouter();
  const key = `farmacova-admin-${entity}-v1`;
  const raw = useSyncExternalStore(
    subscribe,
    () => (demo ? read(key) : null),
    () => null,
  );
  const rows = demo ? parsed(raw, initial, entity) : initial;
  const [draft, setDraft] = useState<AdminRecord | null>(null),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [search, setSearch] = useState(""),
    [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const config = entity === "configuracion";
  const current = draft ?? (config ? rows[0] : null);
  const values = current as unknown as Record<string, unknown> | null;
  function change(key: string, value: unknown) {
    if (current) setDraft({ ...current, [key]: value });
    setError("");
    setMessage("");
  }
  async function upload(file: File) {
    setUploading(true);
    setError("");
    try {
      if (demo)
        throw new Error(
          "La carga de imágenes estará disponible al conectar Supabase. En la demo puedes usar /images/tioflex-raven.png.",
        );
      if (
        file.size > 5 * 1024 * 1024 ||
        !["image/png", "image/jpeg", "image/webp"].includes(file.type)
      )
        throw new Error("Usa PNG, JPG o WebP de hasta 5 MB.");
      const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const valid =
        file.type === "image/png"
          ? bytes[0] === 137 &&
            bytes[1] === 80 &&
            bytes[2] === 78 &&
            bytes[3] === 71
          : file.type === "image/jpeg"
            ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
            : new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
              new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
      if (!valid)
        throw new Error("El contenido no corresponde a una imagen válida.");
      const client = createClient();
      const {
        data: { user },
      } = await client.auth.getUser();
      if (!user?.email_confirmed_at || user.app_metadata.role !== "admin")
        throw new Error("Inicia sesión como administrador.");
      const path = `${user.id}/${crypto.randomUUID()}.${file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp"}`;
      const { error } = await client.storage
        .from("product-images")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw new Error("No pudimos subir la imagen.");
      change(
        "image_path",
        client.storage.from("product-images").getPublicUrl(path).data.publicUrl,
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Error al cargar la imagen.",
      );
    } finally {
      setUploading(false);
    }
  }
  function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!current) return;
    // Los controles de fecha nativos mantienen sus segmentos mientras se editan.
    // Leer el valor completo al enviar evita perder fechas parcialmente escritas.
    const form = new FormData(e.currentTarget);
    const submitted =
      entity === "productos"
        ? {
            ...current,
            promotion_starts_at: form.get("promotion_starts_at") || null,
            promotion_ends_at: form.get("promotion_ends_at") || null,
          }
        : current;
    setError("");
    setMessage("");
    start(async () => {
      try {
        const valid = validateRecord(
          entity,
          submitted,
          process.env.NEXT_PUBLIC_SUPABASE_URL,
        );
        if (demo) {
          const next = rows.some((row) => row.id === valid.id)
            ? rows.map((row) => (row.id === valid.id ? valid : row))
            : [valid, ...rows];
          localStorage.setItem(key, JSON.stringify(next));
          window.dispatchEvent(new Event("farmacova-admin"));
          setDraft(config ? valid : null);
          setMessage(
            "Guardado en este navegador para la demostración del panel.",
          );
        } else {
          const result = await saveAdminRecord(entity, valid);
          if (result.error) {
            setError(result.error);
            return;
          }
          setDraft(null);
          setMessage(
            "Cambios guardados. La web ya muestra la información publicada.",
          );
          router.refresh();
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "No pudimos guardar.",
        );
      }
    });
  }
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-950">
            {entity === "productos"
              ? "Productos, precios y promociones"
              : entity === "sucursales"
                ? "Tus sucursales"
                : "Configuración del Club"}
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            {config
              ? "6 espacios · ₡10.000 por sello · 15% al completar. Estos valores mantienen el programa que definiste."
              : "Los borradores quedan ocultos. Despublica un registro para retirarlo del sitio."}
          </p>
        </div>
        {!config && (
          <button
            onClick={() => {
              setDraft(blank(entity));
              setError("");
              setMessage("");
            }}
            className="btn-primary"
          >
            <Plus size={17} />{" "}
            {entity === "productos" ? "Nuevo producto" : "Nueva sucursal"}
          </button>
        )}
      </div>
      {message && (
        <p
          role="status"
          className="mt-5 rounded-xl bg-green-50 p-4 text-green-800"
        >
          {message}
        </p>
      )}
      <div
        className={`mt-7 grid gap-6 ${!config && current ? "xl:grid-cols-[1fr_1.3fr]" : ""}`}
      >
        {!config && (
          <div>
            <label htmlFor="admin-search" className="sr-only">
              Buscar registros
            </label>
            <input
              id="admin-search"
              className="field mb-4"
              placeholder="Buscar por nombre, marca o enlace"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="space-y-3">
              {rows
                .filter((row) =>
                  JSON.stringify(row)
                    .toLocaleLowerCase("es")
                    .includes(search.toLocaleLowerCase("es")),
                )
                .map((row) => {
                  const product = row as AdminProduct;
                  return (
                    <button
                      key={row.id}
                      onClick={() => {
                        setDraft(row);
                        setError("");
                        setMessage("");
                      }}
                      className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left hover:border-blue-400"
                    >
                      <span>
                        <span className="block font-bold text-blue-950">
                          {"name" in row ? row.name : ""}
                        </span>
                        <span className="mt-1 block text-xs text-slate-500">
                          {"brand" in row
                            ? row.brand
                            : "address" in row
                              ? row.address
                              : ""}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${"published" in row && row.published ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {"published" in row && row.published
                            ? "Publicado"
                            : "Borrador"}
                        </span>
                        {product.price_crc != null && (
                          <span className="text-sm font-bold text-blue-900">
                            {crc(Number(product.price_crc))}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              {rows.length === 0 && (
                <p className="rounded-2xl bg-slate-50 p-6 text-slate-500">
                  Añade tu primer registro para comenzar.
                </p>
              )}
            </div>
          </div>
        )}
        {current && values && (
          <form
            key={current.id}
            onSubmit={save}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-7"
          >
            <h2 className="mb-6 text-xl font-bold text-blue-950">
              {config ? "Condiciones y funcionamiento" : "Editar información"}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {fields[entity].map((field) => {
                const value = values[field];
                const isTextArea = [
                  "description",
                  "address",
                  "hours",
                  "loyalty_terms",
                ].includes(field);
                const id = `edit-${field}`;
                if (
                  typeof value === "boolean" &&
                  field !== "requires_prescription"
                )
                  return (
                    <label
                      key={field}
                      className="flex items-start gap-3 text-sm font-semibold text-slate-700"
                    >
                      <input
                        key={`${id}-${current.id}`}
                        className="mt-1"
                        type="checkbox"
                        checked={value}
                        onChange={(e) => change(field, e.target.checked)}
                      />
                      {names[field]}
                    </label>
                  );
                const options =
                  field === "category_slug"
                    ? [
                        ["dolor", "Dolor y fiebre"],
                        ["respiratorio", "Salud respiratoria"],
                        ["digestivo", "Salud digestiva"],
                        ["prescripcion", "Con receta"],
                        ["nutricion", "Nutrición y suplementos"],
                      ]
                    : field === "availability"
                      ? [
                          ["confirmar", "Confirmar en sucursal"],
                          ["disponible", "Disponible"],
                          ["agotado", "Agotado"],
                        ]
                      : field === "requires_prescription"
                        ? [
                            ["", "Por confirmar"],
                            ["true", "Requiere receta"],
                            ["false", "Sin receta"],
                          ]
                        : null;
                return (
                  <div
                    key={field}
                    className={
                      isTextArea || field === "image_path"
                        ? "sm:col-span-2"
                        : ""
                    }
                  >
                    <label className="field-label" htmlFor={id}>
                      {names[field]}
                    </label>
                    {options ? (
                      <select
                        id={id}
                        className="field"
                        value={value === null ? "" : String(value)}
                        onChange={(e) =>
                          change(
                            field,
                            field === "requires_prescription"
                              ? e.target.value === ""
                                ? null
                                : e.target.value === "true"
                              : e.target.value,
                          )
                        }
                      >
                        {options.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    ) : isTextArea ? (
                      <textarea
                        id={id}
                        className="field"
                        rows={4}
                        maxLength={
                          field === "loyalty_terms" || field === "description"
                            ? 3000
                            : 500
                        }
                        value={String(value ?? "")}
                        onChange={(e) => change(field, e.target.value)}
                      />
                    ) : (
                      <input
                        id={id}
                        name={field}
                        className="field"
                        type={
                          field.includes("price") || field === "bestseller_rank"
                            ? "number"
                            : field.endsWith("_at")
                              ? "datetime-local"
                              : "text"
                        }
                        step={field.includes("price") ? "0.01" : undefined}
                        min={
                          field.includes("price")
                            ? "0.01"
                            : field === "bestseller_rank"
                              ? 1
                              : undefined
                        }
                        max={
                          field.includes("price")
                            ? 1_000_000
                            : field === "bestseller_rank"
                              ? 999
                              : undefined
                        }
                        maxLength={
                          field === "image_path" || field.endsWith("_url")
                            ? 1000
                            : 200
                        }
                        required={["name", "slug"].includes(field)}
                        value={
                          field.endsWith("_at")
                            ? undefined
                            : String(value ?? "")
                        }
                        defaultValue={
                          field.endsWith("_at")
                            ? value && /Z$|[+-]\d{2}:\d{2}$/.test(String(value))
                              ? new Date(
                                  Date.parse(String(value)) - 6 * 3600000,
                                )
                                  .toISOString()
                                  .slice(0, 16)
                              : String(value ?? "")
                            : undefined
                        }
                        onChange={(e) =>
                          change(
                            field,
                            field.endsWith("_at")
                              ? e.target.value || null
                              : e.target.value,
                          )
                        }
                      />
                    )}{" "}
                    {field === "image_path" && (
                      <input
                        aria-label="Cargar imagen del producto"
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="mt-3 max-w-full text-sm"
                        disabled={uploading || pending}
                        onChange={(e) => {
                          if (e.target.files?.[0])
                            void upload(e.target.files[0]);
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {config && (
              <p className="mt-5 text-xs leading-relaxed text-slate-500">
                Los cupones no caducan automáticamente. Pausar la acumulación
                permite seguir canjeando beneficios existentes. Las condiciones
                guardadas quedan registradas con cada nueva inscripción.
              </p>
            )}
            {error && (
              <p className="field-error mt-5" role="alert">
                {error}
              </p>
            )}
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="submit"
                className="btn-primary"
                disabled={pending || uploading}
              >
                <Save size={17} />
                {pending
                  ? "Guardando…"
                  : uploading
                    ? "Cargando imagen…"
                    : "Guardar cambios"}
              </button>
              {!config && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(null);
                    setError("");
                  }}
                  className="btn-secondary"
                  disabled={pending}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}
