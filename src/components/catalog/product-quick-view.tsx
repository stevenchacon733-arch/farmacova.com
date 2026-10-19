"use client";

import { useId, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";

// Tarjeta compacta que abre un panel lateral con la ficha completa. Sin
// JavaScript, el enlace "Ver detalles" lleva a la página del producto.
export function ProductQuickView({
  href,
  name,
  card,
  children,
}: {
  href: string;
  name: string;
  card: ReactNode;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const close = () => {
    const element = dialog.current;
    if (!element?.open || element.dataset.closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return element.close();
    element.dataset.closing = "";
    window.setTimeout(() => {
      delete element.dataset.closing;
      element.close();
    }, 220);
  };
  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-3 transition hover:border-slate-300 hover:shadow-xl hover:shadow-blue-950/5">
      {card}
      <a
        href={href}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey) return;
          event.preventDefault();
          dialog.current?.showModal();
        }}
        aria-haspopup="dialog"
        className="mt-auto inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-blue-900 transition after:absolute after:inset-0 after:rounded-2xl group-hover:border-blue-800 group-hover:bg-blue-800 group-hover:text-white"
      >
        Ver detalles<span className="sr-only"> de {name}</span>
      </a>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="product-drawer"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <p
              id={titleId}
              className="truncate text-sm font-semibold text-slate-500"
            >
              {name}
            </p>
            <button
              type="button"
              onClick={close}
              aria-label="Cerrar detalles"
              className="-mr-2 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </div>
      </dialog>
    </article>
  );
}
