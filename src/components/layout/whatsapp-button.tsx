"use client";

import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

export type WhatsAppContact = {
  id: string;
  name: string;
  hours: string;
  href: string;
};

function WhatsAppIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

// Botón flotante: abre un menú para elegir la sucursal y escribirle por
// WhatsApp con un mensaje de consulta ya redactado.
export function WhatsAppButton({ contacts }: { contacts: WhatsAppContact[] }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggle.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  if (!contacts.length || pathname.startsWith("/administracion")) return null;
  return (
    <div
      ref={root}
      className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6"
    >
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Escríbenos por WhatsApp"
          className="w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-3 bg-[#075e54] px-4 py-3 text-white">
            <div>
              <p className="font-bold">¿En qué te ayudamos?</p>
              <p className="text-xs text-white/85">
                Elige la sucursal a la que quieres escribir.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              className="-mr-1 rounded-full p-1 hover:bg-white/15"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <ul className="max-h-[60dvh] divide-y divide-slate-100 overflow-y-auto">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <a
                  href={contact.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-green-50"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#25d366] text-white">
                    <WhatsAppIcon size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-blue-950">
                      {contact.name}
                    </span>
                    {contact.hours && (
                      <span className="block text-xs text-slate-500">
                        {contact.hours}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        ref={toggle}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={
          open ? "Cerrar menú de WhatsApp" : "Escríbenos por WhatsApp"
        }
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25d366] text-white shadow-lg ring-4 ring-white/70 transition hover:scale-105 hover:bg-[#1ebe5b]"
      >
        {open ? <X size={26} aria-hidden="true" /> : <WhatsAppIcon size={30} />}
      </button>
    </div>
  );
}
