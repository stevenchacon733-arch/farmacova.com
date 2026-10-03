"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
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
  const availableSlides = demo
    ? activeCampaigns(parsePreviewCampaigns(preview, campaigns))
    : campaigns;
  const configuredUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const storagePrefix = configuredUrl
    ? `${configuredUrl}/storage/v1/object/public/campaign-images/`
    : null;
  // An image-only carousel skips campaigns that do not yet have an image.
  const slides = availableSlides.filter((item) => {
    const path = item.image_path;
    return path && (
      /^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(path) ||
      /^data:image\/(png|jpeg|webp);base64,/.test(path) ||
      (storagePrefix && path.startsWith(storagePrefix))
    );
  });
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
  if (!slide?.image_path) return null;

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
      <div className={slides.length > 1 ? "pb-14" : ""}>
        <Link
          key={slide.id}
          href={safeCampaignHref(slide.cta_href) ? slide.cta_href : "/promociones"}
          className="hero-slide relative block h-[clamp(320px,65vw,560px)] w-full"
          aria-label={`${slide.cta_label}: ${slide.title}`}
        >
          <Image
            src={slide.image_path}
            alt={slide.sponsored ? `${slide.title}. Anuncio de ${slide.sponsor}` : slide.title}
            fill
            sizes="100vw"
            className="object-contain"
            unoptimized
          />
        </Link>
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
      {slides.length > 1 && <div className="absolute bottom-3 left-6 right-6 flex items-center justify-center gap-5">
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
            </>
          )}
        </div>
      </div>}
    </section>
  );
}
