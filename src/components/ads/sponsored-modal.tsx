"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import {
  currentPopup,
  parsePreviewPopups,
  popupStorageKey,
  safePopupImage,
  type PopupAd,
} from "@/lib/popup";

const seenKey = "farmacova-anuncio-visto";
const closeMs = 260;

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("farmacova-popup", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("farmacova-popup", listener);
  };
}
function previewSnapshot() {
  try {
    return window.localStorage.getItem(popupStorageKey);
  } catch {
    return null;
  }
}
const emptySnapshot = () => null;
// Cambia cuando el administrador publica otro pop-up, para volver a mostrarlo.
const signature = (ad: PopupAd) => `${ad.id}|${ad.image_path}|${ad.headline}`;

export function SponsoredModal({
  ad: serverAd,
  demo,
}: {
  ad: PopupAd | null;
  demo: boolean;
}) {
  const preview = useSyncExternalStore(
    subscribe,
    demo ? previewSnapshot : emptySnapshot,
    emptySnapshot,
  );
  const ad = demo
    ? currentPopup(parsePreviewPopups(preview, serverAd ? [serverAd] : []))
    : serverAd;
  const [isOpen, setIsOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imagePath = safePopupImage(ad?.image_path, undefined, demo);
  const adSignature = ad ? signature(ad) : null;
  useEffect(() => {
    if (!adSignature) return;
    // Una vez por sesión: volver a mostrarlo en cada visita molesta en móvil
    // y Google penaliza los anuncios intersticiales repetidos.
    try {
      if (window.sessionStorage.getItem(seenKey) === adSignature) return;
    } catch {
      // Sin almacenamiento disponible, se muestra igual.
    }
    // Si el visitante está viendo la ficha de un producto, espera a que la
    // cierre: no se apila un diálogo encima de otro.
    let timer = 0;
    const open = () => {
      if (document.querySelector("dialog[open]"))
        timer = window.setTimeout(open, 1000);
      else setIsOpen(true);
    };
    timer = window.setTimeout(open, 3000);
    return () => window.clearTimeout(timer);
  }, [adSignature]);
  const close = () => {
    if (closing) return;
    try {
      if (adSignature) window.sessionStorage.setItem(seenKey, adSignature);
    } catch {
      // Ignorar: el cierre funciona igual.
    }
    // Deja terminar la animación de salida antes de cerrar el diálogo.
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    setClosing(true);
    window.setTimeout(
      () => {
        setIsOpen(false);
        setClosing(false);
      },
      reduced ? 0 : closeMs,
    );
  };
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!isOpen) {
      if (dialog.open) dialog.close();
      return;
    }
    const previousOverflow = document.body.style.overflow;
    const preventCancel = (event: Event) => event.preventDefault();
    dialog.addEventListener("cancel", preventCancel);
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => {
      dialog.removeEventListener("cancel", preventCancel);
      document.body.style.overflow = previousOverflow;
      if (dialog.open) dialog.close();
    };
  }, [isOpen]);

  if (!ad) return null;
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="sponsor-title"
      aria-describedby="sponsor-description"
      onCancel={(event) => event.preventDefault()}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      data-closing={closing ? "true" : undefined}
      className="sponsor-dialog w-[calc(100%-2rem)] max-w-[554px] overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl"
    >
      <div className="sponsor-part flex items-center justify-between gap-3 bg-blue-950 px-4 py-3 text-white">
        <h2 id="sponsor-title" className="text-sm font-semibold">
          Publicidad · {ad.sponsor}
        </h2>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar anuncio"
          className="rounded-full bg-white/15 p-2 transition hover:rotate-90 hover:bg-white/25"
          autoFocus
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {imagePath ? (
        <div className="sponsor-image relative overflow-hidden">
          <Image
            src={imagePath}
            alt={`${ad.product}: ${ad.headline}. Anuncio de ${ad.sponsor}.`}
            width={554}
            height={554}
            sizes="(max-width: 600px) calc(100vw - 32px), 554px"
            className="h-auto max-h-[calc(100dvh-11rem)] w-full object-contain"
            unoptimized={!imagePath.startsWith("/images/")}
          />
        </div>
      ) : (
        <div className="sponsor-part p-8">
          <h3 className="text-4xl font-bold text-blue-950">{ad.product}</h3>
          <p className="mt-4 text-xl text-blue-800">{ad.headline}</p>
        </div>
      )}
      <div className="sponsor-part p-4">
        <p
          id="sponsor-description"
          className="text-xs leading-relaxed text-slate-500"
        >
          La disponibilidad y las condiciones de venta se confirman en sucursal.
        </p>
        <button
          type="button"
          onClick={close}
          className="btn-primary mt-3 w-full"
        >
          Cerrar y continuar
        </button>
      </div>
    </dialog>
  );
}
