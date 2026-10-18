"use client";

import Image from "next/image";
import {
  useState,
  useSyncExternalStore,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { LoaderCircle, Plus, Save } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { checkImageFile, imageDataUrl } from "@/lib/image-file";
import {
  currentPopup,
  parsePreviewPopups,
  popupStorageKey,
  safePopupImage,
  validatePopup,
  type PopupAd,
} from "@/lib/popup";

function subscribePreview(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("farmacova-popup", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("farmacova-popup", listener);
  };
}
function previewSnapshot() {
  try {
    return localStorage.getItem(popupStorageKey);
  } catch {
    return null;
  }
}
const emptySnapshot = () => null;
function localDate(value: string) {
  return new Date(Date.parse(value) - 6 * 3600000).toISOString().slice(0, 16);
}
function fromLocalDate(value: string) {
  return value ? new Date(`${value}-06:00`).toISOString() : "";
}
function newPopup(): PopupAd {
  return {
    id: crypto.randomUUID(),
    sponsor: "",
    product: "",
    headline: "",
    description: "",
    image_path: null,
    active: false,
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
}

export function PopupEditor({
  initialAds,
  demo,
}: {
  initialAds: PopupAd[];
  demo: boolean;
}) {
  const [items, setItems] = useState(initialAds);
  const preview = useSyncExternalStore(
    subscribePreview,
    demo ? previewSnapshot : emptySnapshot,
    emptySnapshot,
  );
  const displayed = demo ? parsePreviewPopups(preview, items) : items;
  const live = currentPopup(displayed);
  const [draft, setDraft] = useState<PopupAd | null>(null);
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const change = <K extends keyof PopupAd>(key: K, value: PopupAd[K]) =>
    setDraft((current) => (current ? { ...current, [key]: value } : current));
  function select(ad: PopupAd) {
    setDraft(ad);
    setError("");
    setSuccess("");
  }
  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    setError("");
    setUploading(true);
    try {
      const extension = await checkImageFile(file, demo ? 2 : 5);
      if (demo) {
        change("image_path", await imageDataUrl(file));
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
    const ad: PopupAd = {
      ...draft,
      starts_at: fromLocalDate(String(form.get("starts_at") ?? "")),
      ends_at: fromLocalDate(String(form.get("ends_at") ?? "")),
    };
    const problem = validatePopup(ad);
    if (problem) {
      setError(problem);
      return;
    }
    setPending(true);
    try {
      const updated = [
        ad,
        ...displayed.filter((item) => item.id !== ad.id),
      ].slice(0, 20);
      if (demo) {
        try {
          localStorage.setItem(popupStorageKey, JSON.stringify(updated));
        } catch {
          throw new Error(
            "No hay espacio para guardar la vista previa. Usa una imagen más pequeña.",
          );
        }
        window.dispatchEvent(new Event("farmacova-popup"));
      } else {
        const { error: saveError } = await createClient()
          .from("sponsored_ads")
          .upsert(ad, { onConflict: "id" });
        if (saveError)
          throw new Error(
            "No pudimos guardar el pop-up. Revisa tu sesión de administrador y la conexión.",
          );
      }
      setItems(updated);
      setDraft(ad);
      setSuccess(
        demo
          ? "Pop-up guardado en esta vista previa. Abre la portada para verlo."
          : "Pop-up guardado. Aparece en la portada según su estado y fechas.",
      );
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : "No pudimos guardar el pop-up.",
      );
    } finally {
      setPending(false);
    }
  }

  const draftImage = safePopupImage(draft?.image_path, undefined, demo);
  return (
    <div className="mt-7 grid items-start gap-7 lg:grid-cols-[0.8fr_1.5fr]">
      <aside className="rounded-2xl border border-slate-200 p-5">
        <button
          type="button"
          onClick={() => select(newPopup())}
          className="btn-primary w-full"
        >
          <Plus size={17} aria-hidden="true" /> Nuevo pop-up
        </button>
        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          Se muestra uno a la vez: el activo y vigente que empezó más
          recientemente. Si ninguno está activo, la portada no muestra pop-up.
        </p>
        <div className="mt-4 space-y-3">
          {displayed.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => select(item)}
              className={`w-full rounded-xl border p-4 text-left ${draft?.id === item.id ? "border-blue-600 bg-blue-50" : "border-slate-200"}`}
            >
              <span className="text-xs text-slate-500">
                {live?.id === item.id
                  ? "En la portada ahora"
                  : item.active
                    ? "Activo · fuera de fechas"
                    : "Inactivo"}
              </span>
              <span className="mt-2 block text-sm font-semibold text-blue-950">
                {item.product || "Pop-up sin nombre"}
              </span>
              <span className="block text-xs text-slate-500">
                {item.sponsor}
              </span>
            </button>
          ))}
        </div>
      </aside>
      {draft ? (
        <form
          key={draft.id}
          onSubmit={save}
          className="space-y-5 rounded-2xl border border-slate-200 p-6 sm:p-8"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold text-blue-950">
              Editar pop-up
            </h3>
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
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="popup-sponsor" className="field-label">
                Patrocinador o laboratorio
              </label>
              <input
                id="popup-sponsor"
                maxLength={120}
                value={draft.sponsor}
                onChange={(event) => change("sponsor", event.target.value)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="popup-product" className="field-label">
                Producto
              </label>
              <input
                id="popup-product"
                maxLength={120}
                value={draft.product}
                onChange={(event) => change("product", event.target.value)}
                className="field"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="popup-headline" className="field-label">
              Titular (se lee si la imagen no carga)
            </label>
            <input
              id="popup-headline"
              maxLength={200}
              value={draft.headline}
              onChange={(event) => change("headline", event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="popup-description" className="field-label">
              Descripción interna
            </label>
            <textarea
              id="popup-description"
              maxLength={1000}
              rows={3}
              value={draft.description}
              onChange={(event) => change("description", event.target.value)}
              className="field"
              required
            />
          </div>
          <div>
            <label htmlFor="popup-image" className="field-label">
              Imagen del pop-up
            </label>
            <input
              id="popup-image"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={upload}
              disabled={uploading || pending}
              className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-5 file:py-3 file:font-semibold file:text-blue-800"
            />
            <p className="mt-2 text-xs text-slate-500">
              PNG, JPG o WebP de hasta {demo ? 2 : 5} MB. Se recomienda formato
              vertical (por ejemplo 900 × 1600 px); se muestra completa.
            </p>
            {uploading && (
              <p className="mt-3 text-sm text-blue-800" role="status">
                Cargando imagen…
              </p>
            )}
            {draftImage && (
              <div className="mt-4">
                <Image
                  src={draftImage}
                  alt="Vista previa del pop-up"
                  width={180}
                  height={320}
                  className="h-64 w-auto rounded-xl border border-slate-200 object-contain"
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
            <div>
              <label htmlFor="popup-start" className="field-label">
                Inicio · Costa Rica
              </label>
              <input
                id="popup-start"
                type="datetime-local"
                name="starts_at"
                defaultValue={localDate(draft.starts_at)}
                className="field"
                required
              />
            </div>
            <div>
              <label htmlFor="popup-end" className="field-label">
                Fin · Costa Rica
              </label>
              <input
                id="popup-end"
                type="datetime-local"
                name="ends_at"
                defaultValue={localDate(draft.ends_at)}
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
              <>
                <Save size={17} aria-hidden="true" /> Guardar pop-up
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-slate-500">
          Selecciona un pop-up o crea uno nuevo.
        </div>
      )}
    </div>
  );
}
