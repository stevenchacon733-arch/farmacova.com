"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Pill,
  Plus,
} from "lucide-react";
import {
  activeCampaigns,
  campaignStorageKey,
  parsePreviewCampaigns,
  safeCampaignHref,
  type Campaign,
} from "@/lib/campaigns";

function subscribe(listener: () => void) {
  window.addEventListener("storage", listener);
  window.addEventListener("farmacova-campaigns", listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener("farmacova-campaigns", listener);
  };
}
function previewSnapshot() {
  try {
    return window.localStorage.getItem(campaignStorageKey);
  } catch {
    return null;
  }
}
const emptySnapshot = () => null;
function subscribeMotion(listener: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}
function motionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function CampaignCarousel({
  campaigns,
  demo,
}: {
  campaigns: Campaign[];
  demo: boolean;
}) {
  const preview = useSyncExternalStore(
    subscribe,
    demo ? previewSnapshot : emptySnapshot,
    emptySnapshot,
  );
  const slides = demo
    ? activeCampaigns(parsePreviewCampaigns(preview, campaigns))
    : campaigns;
  const [selected, setSelected] = useState(0);
  const [autoChoice, setAutoChoice] = useState<boolean | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeMotion,
    motionSnapshot,
    () => false,
  );
  const autoPlay = autoChoice ?? !reducedMotion;
  const touch = useRef<{ x: number; y: number } | null>(null);
  const index = slides.length ? selected % slides.length : 0;
  const slide = slides[index];
  useEffect(() => {
    if (!autoPlay || hovered || focused || slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !document.querySelector("dialog[open]"))
        setSelected((current) => (current + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [autoPlay, hovered, focused, selected, slides.length]);
  const move = (direction: number) =>
    setSelected(
      (current) => (current + direction + slides.length) % slides.length,
    );
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const storagePrefix = configuredUrl
    ? `${configuredUrl}/storage/v1/object/public/campaign-images/`
    : null;
  const imagePath =
    slide?.image_path &&
    (/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(
      slide.image_path,
    ) ||
      slide.image_path.startsWith("data:image/png;base64,") ||
      slide.image_path.startsWith("data:image/jpeg;base64,") ||
      slide.image_path.startsWith("data:image/webp;base64,") ||
      (storagePrefix && slide.image_path.startsWith(storagePrefix)))
      ? slide.image_path
      : null;

  return (
    <section
      className="hero-carousel relative overflow-hidden text-blue-950"
      aria-roledescription="carrusel"
      aria-label="Ofertas y productos patrocinados"
      tabIndex={0}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
      onKeyDown={(event) => {
        if (
          slides.length > 1 &&
          (event.key === "ArrowLeft" || event.key === "ArrowRight")
        ) {
          event.preventDefault();
          move(event.key === "ArrowRight" ? 1 : -1);
        }
      }}
      onTouchStart={(event) => {
        touch.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        };
      }}
      onTouchEnd={(event) => {
        if (!touch.current || slides.length < 2) return;
        const dx = event.changedTouches[0].clientX - touch.current.x;
        const dy = event.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy))
          move(dx < 0 ? 1 : -1);
        touch.current = null;
      }}
    >
      <div
        key={slide?.id ?? "empty"}
        className="hero-slide shell grid min-h-[480px] items-center gap-8 px-5 pb-24 pt-10 md:grid-cols-2 md:gap-12 md:px-12 lg:min-h-[530px]"
      >
        <div className="order-2 flex justify-center">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={
                slide.sponsored ? `Anuncio de ${slide.sponsor}` : slide.eyebrow
              }
              width={554}
              height={554}
              sizes="(max-width: 768px) calc(100vw - 80px), 420px"
              className="max-h-[330px] w-auto max-w-full rounded-sm object-contain shadow-xl shadow-blue-950/10 md:max-h-[400px]"
              unoptimized
            />
          ) : (
            <div className="w-full max-w-sm space-y-4">
              {["Productos del mes", "Ofertas especiales", "Promociones"].map(
                (text, itemIndex) => (
                  <div
                    key={text}
                    className={`flex items-center gap-5 rounded-sm border border-blue-200 bg-white/80 px-6 py-5 text-blue-900 shadow-lg shadow-blue-950/5 ${itemIndex === 1 ? "ml-7" : "mr-7"}`}
                  >
                    <Pill size={36} strokeWidth={1.2} aria-hidden="true" />
                    <span className="text-lg font-semibold">{text}</span>
                  </div>
                ),
              )}
            </div>
          )}
        </div>
        <div
          className="order-1"
          aria-live={autoPlay && !hovered && !focused ? "off" : "polite"}
          aria-atomic="true"
        >
          <span className="text-xs font-bold uppercase tracking-[0.15em] text-green-700">
            {slide?.eyebrow ?? "Farmacova · Cuidamos de ti"}
          </span>
          <h1 className="mt-4 whitespace-pre-line text-4xl font-bold leading-[1.15] tracking-[-0.035em] sm:text-5xl">
            {slide?.title ?? "Tu farmacia.\nMás cerca de ti."}
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
            {slide?.description ??
              "Descubre las promociones del mes y confirma su disponibilidad en sucursal."}
          </p>
          <Link
            href={
              slide && safeCampaignHref(slide.cta_href)
                ? slide.cta_href
                : "/promociones"
            }
            className="mt-7 inline-flex min-w-60 items-center justify-center gap-3 rounded-sm bg-green-600 px-6 py-4 text-base font-bold text-white hover:bg-green-700"
          >
            {slide?.cta_label ?? "Ver promociones"}
            <span className="flex h-5 w-5 items-center justify-center">
              <Plus size={13} aria-hidden="true" />
            </span>
          </Link>
          {slide?.sponsored && (
            <p className="mt-4 text-xs text-slate-600">
              Espacio patrocinado por {slide.sponsor}
            </p>
          )}
        </div>
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Anuncio anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-950/85 p-2.5 text-white hover:bg-blue-800 sm:left-4 sm:p-3"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Siguiente anuncio"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-blue-950/85 p-2.5 text-white hover:bg-blue-800 sm:right-4 sm:p-3"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>
        </>
      )}
      <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-center justify-between gap-3 md:left-14 md:right-14">
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(itemIndex)}
              aria-label={`Mostrar anuncio ${itemIndex + 1}: ${item.eyebrow}`}
              aria-current={itemIndex === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition ${itemIndex === index ? "w-7 bg-blue-900" : "w-2.5 bg-blue-900/25 hover:bg-blue-900/50"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {demo && (
            <Link
              href="/administracion/anuncios"
              className="text-xs text-blue-900 underline underline-offset-4"
            >
              Editar carrusel
            </Link>
          )}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setAutoChoice(!autoPlay)}
                aria-label={autoPlay ? "Pausar carrusel" : "Reanudar carrusel"}
                className="rounded-full bg-blue-950 p-2 text-white hover:bg-blue-800"
              >
                {autoPlay ? (
                  <Pause size={17} aria-hidden="true" />
                ) : (
                  <Play size={17} aria-hidden="true" />
                )}
              </button>
              <span className="text-xs text-blue-900">
                {index + 1} / {slides.length}
              </span>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
