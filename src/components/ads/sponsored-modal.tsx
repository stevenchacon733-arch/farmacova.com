"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { SponsoredAd } from "@/lib/catalog";

export function SponsoredModal({ ad }: { ad: SponsoredAd }) {
  const [isOpen, setIsOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const imagePath =
    ad.image_path &&
    /^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(ad.image_path)
      ? ad.image_path
      : null;
  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), 3000);
    return () => window.clearTimeout(timer);
  }, []);
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
      className="sponsor-dialog w-[calc(100%-2rem)] max-w-[554px] overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl"
    >
      <div className="flex items-center justify-between gap-3 bg-blue-950 px-4 py-3 text-white">
        <h2 id="sponsor-title" className="text-sm font-semibold">
          Publicidad · {ad.sponsor}
        </h2>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          aria-label="Cerrar anuncio"
          className="rounded-full bg-white/15 p-2 hover:bg-white/25"
          autoFocus
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      {imagePath ? (
        <Image
          src={imagePath}
          alt={`${ad.product}: ${ad.headline}. Anuncio de ${ad.sponsor}.`}
          width={554}
          height={554}
          sizes="(max-width: 600px) calc(100vw - 32px), 554px"
          className="h-auto max-h-[calc(100dvh-11rem)] w-full object-contain"
          unoptimized
        />
      ) : (
        <div className="p-8">
          <h3 className="text-4xl font-bold text-blue-950">{ad.product}</h3>
          <p className="mt-4 text-xl text-blue-800">{ad.headline}</p>
        </div>
      )}
      <div className="p-4">
        <p
          id="sponsor-description"
          className="text-xs leading-relaxed text-slate-500"
        >
          La disponibilidad y las condiciones de venta se confirman en sucursal.
        </p>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="btn-primary mt-3 w-full"
        >
          Cerrar y continuar
        </button>
      </div>
    </dialog>
  );
}
