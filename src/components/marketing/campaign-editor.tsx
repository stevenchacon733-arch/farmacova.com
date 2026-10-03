"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { LoaderCircle, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  campaignStorageKey,
  parsePreviewCampaigns,
  validateCampaign,
  type Campaign,
} from "@/lib/campaigns";

function subscribePreview(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("farmacova-campaigns", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("farmacova-campaigns", listener);
  };
}
function previewSnapshot() {
  try {
    return localStorage.getItem(campaignStorageKey);
  } catch {
    return null;
  }
}
const emptySnapshot = () => null;

function initialItem(position: number): Campaign {
  return {
    id: crypto.randomUUID(),
    title: "",
    eyebrow: "",
    description: "",
    image_path: null,
    cta_label: "Ver detalles",
    cta_href: "/catalogo",
    sponsored: false,
    sponsor: "",
    position,
    active: false,
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
}
function localDate(value: string) {
  return new Date(Date.parse(value) - 6 * 3600000).toISOString().slice(0, 16);
}
function fromLocalDate(value: string) {
  return value ? new Date(`${value}-06:00`).toISOString() : "";
}
async function imageData(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function CampaignEditor({
  initialCampaigns,
  demo,
}: {
  initialCampaigns: Campaign[];
  demo: boolean;
}) {
  const [items, setItems] = useState(initialCampaigns);
  const preview = useSyncExternalStore(
    subscribePreview,
    demo ? previewSnapshot : emptySnapshot,
    emptySnapshot,
  );
  const displayedItems = demo ? parsePreviewCampaigns(preview, items) : items;
  const [draft, setDraft] = useState<Campaign | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  function availableItems() {
    if (!demo) return items;
    try {
      return parsePreviewCampaigns(
        localStorage.getItem(campaignStorageKey),
        items,
      );
    } catch {
      return items;
    }
  }
  function edit(item: Campaign) {
    const current = availableItems();
    setItems(current);
    setDraft(current.find((value) => value.id === item.id) ?? item);
    setError("");
    setSuccess("");
  }
  function change<K extends keyof Campaign>(key: K, value: Campaign[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    setError("");
    setUploading(true);
    try {
      const maxSize = demo ? 2 * 1024 * 1024 : 5 * 1024 * 1024;
      if (
        !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
        file.size > maxSize
      )
        throw new Error(
          `Usa una imagen PNG, JPG o WebP de hasta ${demo ? 2 : 5} MB.`,
        );
      const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
      const png =
        bytes[0] === 137 &&
        bytes[1] === 80 &&
        bytes[2] === 78 &&
        bytes[3] === 71;
      const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
      const webp =
        new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
        new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
      if (!(
        (file.type === "image/png" && png) ||
        (file.type === "image/jpeg" && jpg) ||
        (file.type === "image/webp" && webp)
      ))
        throw new Error(
          "El archivo no coincide con un formato de imagen admitido.",
        );
      if (demo) {
        change("image_path", await imageData(file));
      } else {
        const client = createClient();
        const {
          data: { user },
          error: userError,
        } = await client.auth.getUser();
        if (userError || user?.app_metadata.role !== "admin")
          throw new Error(
            "Tu sesión de administrador no está disponible. Ingresa otra vez.",
          );
        const extension =
          file.type === "image/png"
            ? "png"
            : file.type === "image/jpeg"
              ? "jpg"
              : "webp";
        const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await client.storage
          .from("campaign-images")
          .upload(path, file, { contentType: file.type, upsert: false });
        if (uploadError)
          throw new Error(
            "No pudimos subir la imagen. Revisa la conexión y los permisos de tu cuenta.",
          );
        change(
          "image_path",
          client.storage.from("campaign-images").getPublicUrl(path).data
            .publicUrl,
        );
      }
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "No pudimos cargar la imagen.",
      );
    } finally {
      setUploading(false);
    }
  }
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft || pending || uploading) return;
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const campaign = {
      ...draft,
      starts_at: fromLocalDate(String(form.get("starts_at") ?? "")),
      ends_at: fromLocalDate(String(form.get("ends_at") ?? "")),
    };
    const problem = validateCampaign(campaign);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    try {
      const current = availableItems();
      const updated = [
        ...current.filter((item) => item.id !== campaign.id),
        campaign,
      ].sort((a, b) => a.position - b.position);
      if (demo) {
        if (updated.length > 50)
          throw new Error("La vista previa admite hasta 50 anuncios.");
        try {
          localStorage.setItem(campaignStorageKey, JSON.stringify(updated));
        } catch {
          throw new Error(
            "No hay espacio para guardar la vista previa. Usa una imagen más pequeña.",
          );
        }
        window.dispatchEvent(new Event("farmacova-campaigns"));
      } else {
        const { error: saveError } = await createClient()
          .from("hero_campaigns")
          .upsert(campaign, { onConflict: "id" });
        if (saveError)
          throw new Error(
            "No pudimos guardar el anuncio. Revisa tu sesión de administrador y la conexión.",
          );
      }
      setItems(updated);
      setSuccess(
        demo
          ? "Anuncio guardado en esta vista previa. Vuelve a la portada para verlo."
          : "Anuncio guardado. Su publicación respeta las fechas y el estado que elegiste.",
      );
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "No pudimos guardar el anuncio.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-7">
      {demo && (
        <p className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
          Modo de vista previa: puedes probar el panel. Los cambios se guardan
          solo en este navegador y no publican anuncios para otros visitantes.
          El panel real requiere tu cuenta de administrador.
        </p>
      )}
      <div className="grid items-start gap-7 lg:grid-cols-[0.8fr_1.5fr]">
        <aside className="rounded-2xl border border-slate-200 p-5">
          <button
            type="button"
            onClick={() => {
              const current = availableItems();
              setItems(current);
              setDraft(
                initialItem(
                  Math.max(0, ...current.map((item) => item.position)) + 1,
                ),
              );
              setSuccess("");
              setError("");
            }}
            className="btn-primary w-full"
          >
            <Plus size={17} aria-hidden="true" /> Nuevo anuncio
          </button>
          <div className="mt-5 space-y-3">
            {displayedItems.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => edit(item)}
                className={`w-full rounded-xl border p-4 text-left ${draft?.id === item.id ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}
              >
                <span className="text-xs text-slate-500">
                  Orden {item.position} · {item.active ? "Activo" : "Inactivo"}
                  {item.sponsored ? " · Patrocinado" : ""}
                </span>
                <span className="mt-2 block text-sm font-semibold text-blue-950">
                  {item.eyebrow || item.title}
                </span>
              </button>
            ))}
          </div>
          <Link
            href="/"
            className="mt-5 block text-center text-sm font-semibold text-blue-800 underline"
          >
            Ver portada
          </Link>
        </aside>
        {draft ? (
          <form
            key={draft.id}
            onSubmit={save}
            className="space-y-5 rounded-2xl border border-slate-200 p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-semibold text-blue-950">
                Editar anuncio
              </h2>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={draft.active}
                  onChange={(event) => change("active", event.target.checked)}
                  className="accent-blue-800"
                />{" "}
                Publicar durante su vigencia
              </label>
            </div>
            <div>
              <label className="field-label" htmlFor="campaign-title">
                Título para identificar el anuncio
              </label>
              <textarea
                id="campaign-title"
                maxLength={120}
                rows={2}
                value={draft.title}
                onChange={(event) => change("title", event.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label className="field-label" htmlFor="campaign-eyebrow">
                Nombre del producto o campaña
              </label>
              <input
                id="campaign-eyebrow"
                maxLength={100}
                value={draft.eyebrow}
                onChange={(event) => change("eyebrow", event.target.value)}
                className="field"
              />
            </div>
            <div>
              <label className="field-label" htmlFor="campaign-description">
                Descripción
              </label>
              <textarea
                id="campaign-description"
                maxLength={500}
                rows={3}
                value={draft.description}
                onChange={(event) => change("description", event.target.value)}
                className="field"
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="campaign-button" className="field-label">
                  Etiqueta accesible del enlace
                </label>
                <input
                  id="campaign-button"
                  maxLength={60}
                  value={draft.cta_label}
                  onChange={(event) => change("cta_label", event.target.value)}
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="campaign-link" className="field-label">
                  Destino al tocar la imagen
                </label>
                <input
                  id="campaign-link"
                  value={draft.cta_href}
                  onChange={(event) => change("cta_href", event.target.value)}
                  className="field"
                  placeholder="/catalogo/tioflex"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="campaign-image" className="field-label">
                Imagen del anuncio
              </label>
              <input
                id="campaign-image"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={upload}
                disabled={uploading || pending}
                className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-5 file:py-3 file:font-semibold file:text-blue-800"
              />
              <p className="mt-2 text-xs text-slate-500">
                PNG, JPG o WebP. La imagen se muestra completa, sin recortarla.
                El carrusel muestra solo la imagen; los textos no se superponen.
                Los anuncios sin imagen quedan ocultos en la portada.
              </p>
              {uploading && (
                <p className="mt-3 text-sm text-blue-800" role="status">
                  Cargando imagen…
                </p>
              )}
              {draft.image_path && (
                <div className="mt-4">
                  <Image
                    src={draft.image_path}
                    alt="Vista previa del anuncio seleccionado"
                    width={240}
                    height={240}
                    className="h-48 w-48 rounded-xl border border-slate-200 object-contain"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => change("image_path", null)}
                    className="mt-3 text-xs font-semibold text-blue-800 underline"
                  >
                    Quitar imagen
                  </button>
                </div>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.sponsored}
                  onChange={(event) =>
                    change("sponsored", event.target.checked)
                  }
                  className="accent-blue-800"
                />{" "}
                Espacio patrocinado
              </label>
              <div>
                <label htmlFor="campaign-sponsor" className="field-label">
                  Laboratorio o patrocinador
                </label>
                <input
                  id="campaign-sponsor"
                  maxLength={120}
                  value={draft.sponsor}
                  onChange={(event) => change("sponsor", event.target.value)}
                  className="field"
                  required={draft.sponsored}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label htmlFor="campaign-order" className="field-label">
                  Orden
                </label>
                <input
                  id="campaign-order"
                  type="number"
                  min={1}
                  max={999}
                  value={draft.position}
                  onChange={(event) =>
                    change("position", Number(event.target.value))
                  }
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="campaign-start" className="field-label">
                  Inicio · Costa Rica
                </label>
                <input
                  id="campaign-start"
                  type="datetime-local"
                  name="starts_at"
                  defaultValue={
                    draft.starts_at ? localDate(draft.starts_at) : ""
                  }
                  className="field"
                  required
                />
              </div>
              <div>
                <label htmlFor="campaign-end" className="field-label">
                  Fin · Costa Rica
                </label>
                <input
                  id="campaign-end"
                  type="datetime-local"
                  name="ends_at"
                  defaultValue={draft.ends_at ? localDate(draft.ends_at) : ""}
                  className="field"
                  required
                />
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl bg-red-50 p-4 text-sm text-red-700"
              >
                {error}
              </p>
            )}
            {success && (
              <p
                role="status"
                className="rounded-xl bg-green-50 p-4 text-sm text-green-800"
              >
                {success}
              </p>
            )}
            <button
              type="submit"
              disabled={pending || uploading}
              className="btn-primary"
            >
              <Save size={17} aria-hidden="true" />
              {pending ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                    aria-hidden="true"
                  />{" "}
                  Guardando…
                </>
              ) : (
                "Guardar anuncio"
              )}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
            Selecciona una campaña o crea un nuevo anuncio para el carrusel.
          </div>
        )}
      </div>
    </div>
  );
}
