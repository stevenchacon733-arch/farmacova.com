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
      className="hero-carousel relative overflow-hidden rounded-2xl bg-blue-700 text-white"
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
        className="hero-slide grid min-h-[420px] items-center gap-7 px-6 pb-28 pt-8 sm:pb-20 md:grid-cols-[0.95fr_1fr] md:gap-12 md:px-14 md:pt-10 lg:min-h-[470px]"
      >
        <div className="flex justify-center">
          {imagePath ? (
            <Image
              src={imagePath}
              alt={
                slide.sponsored ? `Anuncio de ${slide.sponsor}` : slide.eyebrow
              }
              width={554}
              height={554}
              sizes="(max-width: 768px) calc(100vw - 88px), 410px"
              className="max-h-[340px] w-auto max-w-full rounded-xl object-contain shadow-xl md:max-h-[370px]"
              unoptimized
            />
          ) : (
            <div className="w-full max-w-sm space-y-4">
              {["Medicamentos", "Productos destacados", "Promociones"].map(
                (text, itemIndex) => (
                  <div
                    key={text}
                    className={`flex items-center gap-5 rounded-2xl border border-white/20 bg-white/10 px-6 py-5 ${itemIndex === 1 ? "ml-7" : "mr-7"}`}
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
          aria-live={autoPlay && !hovered && !focused ? "off" : "polite"}
          aria-atomic="true"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.15em] text-blue-100">
            {slide?.eyebrow ?? "Farmacova · Cuidamos de ti"}
          </span>
          <h1 className="mt-4 whitespace-pre-line text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[3.25rem]">
            {slide?.title ?? "Tu farmacia.\nMás cerca de ti."}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-blue-100">
            {slide?.description ??
              "Explora nuestros medicamentos y confirma su disponibilidad en sucursal."}
          </p>
          <Link
            href={
              slide && safeCampaignHref(slide.cta_href)
                ? slide.cta_href
                : "/catalogo"
            }
            className="mt-7 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-bold text-blue-950 hover:bg-green-50"
          >
            {slide?.cta_label ?? "Ver medicamentos"}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-950 text-white">
              <Plus size={13} aria-hidden="true" />
            </span>
          </Link>
          {slide?.sponsored && (
            <p className="mt-4 text-xs text-blue-100">
              Espacio patrocinado por {slide.sponsor}
            </p>
          )}
        </div>
      </div>
      <div className="absolute bottom-5 left-6 right-6 flex flex-wrap items-center justify-between gap-3 md:left-14 md:right-14">
        <div className="flex max-w-full flex-wrap items-center gap-2">
          {slides.map((item, itemIndex) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelected(itemIndex)}
              aria-label={`Mostrar anuncio ${itemIndex + 1}: ${item.eyebrow}`}
              aria-current={itemIndex === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition ${itemIndex === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3">
          {demo && (
            <Link
              href="/administracion/anuncios"
              className="text-xs text-blue-100 underline underline-offset-4"
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
                className="rounded-full border border-white/30 p-2 hover:bg-white/10"
              >
                {autoPlay ? (
                  <Pause size={17} aria-hidden="true" />
                ) : (
                  <Play size={17} aria-hidden="true" />
                )}
              </button>
              <span className="text-xs text-blue-100">
                {index + 1} / {slides.length}
              </span>
              <button
                type="button"
                onClick={() => move(-1)}
                aria-label="Anuncio anterior"
                className="rounded-full border border-white/30 p-2 hover:bg-white/10"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => move(1)}
                aria-label="Siguiente anuncio"
                className="rounded-full border border-white/30 p-2 hover:bg-white/10"
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
