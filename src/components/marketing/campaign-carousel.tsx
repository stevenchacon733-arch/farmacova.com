"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  activeCampaigns,
  campaignStorageKey,
  parsePreviewCampaigns,
  safeCampaignHref,
  uniqueCampaignImages,
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
// Tiempo que se muestra cada anuncio antes de pasar al siguiente.
const INTERVAL_MS = 6000;

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
  const slides = uniqueCampaignImages(availableSlides).filter((item) => {
    const path = item.image_path;
    return (
      path &&
      (/^\/images\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$/i.test(path) ||
        /^data:image\/(png|jpeg|webp);base64,/.test(path) ||
        (storagePrefix && path.startsWith(storagePrefix)))
    );
  });
  const [selected, setSelected] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const index = slides.length ? selected % slides.length : 0;
  const slide = slides[index];
  // Siempre en marcha: solo espera si la pestaña está oculta o hay un
  // diálogo abierto (pop-up o ficha de producto). Reinicia al cambiar.
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => {
      if (!document.hidden && !document.querySelector("dialog[open]"))
        setSelected((current) => (current + 1) % slides.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [selected, slides.length]);
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
        className={`relative h-[clamp(320px,65vw,560px)] w-full ${slides.length > 1 ? "mb-12" : ""}`}
      >
        {slides.map((item, itemIndex) => {
          const active = itemIndex === index;
          return (
            <Link
              key={item.id}
              href={
                safeCampaignHref(item.cta_href) ? item.cta_href : "/promociones"
              }
              data-active={active}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              className={`hero-slide-layer absolute inset-0 block ${active ? "z-10" : "pointer-events-none"}`}
              aria-label={`${item.cta_label}: ${item.title}`}
            >
              <Image
                src={item.image_path!}
                alt={
                  item.sponsored
                    ? `${item.title}. Anuncio de ${item.sponsor}`
                    : item.title
                }
                fill
                sizes="100vw"
                className="object-contain"
                unoptimized={!item.image_path!.startsWith("/images/")}
                preload={itemIndex === 0}
              />
            </Link>
          );
        })}
      </div>
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Anuncio anterior"
            className="absolute left-4 top-[calc(50%-1.5rem)] z-20 hidden -translate-y-1/2 rounded-full bg-white/80 p-2.5 text-blue-950 shadow-sm backdrop-blur transition hover:bg-white sm:block"
          >
            <ChevronLeft size={22} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Siguiente anuncio"
            className="absolute right-4 top-[calc(50%-1.5rem)] z-20 hidden -translate-y-1/2 rounded-full bg-white/80 p-2.5 text-blue-950 shadow-sm backdrop-blur transition hover:bg-white sm:block"
          >
            <ChevronRight size={22} aria-hidden="true" />
          </button>
          <div className="absolute bottom-4 left-6 right-6 z-20 flex flex-wrap items-center justify-center gap-2">
            {slides.map((item, itemIndex) => {
              const active = itemIndex === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected(itemIndex)}
                  aria-label={`Mostrar anuncio ${itemIndex + 1}: ${item.eyebrow}`}
                  aria-current={active ? "true" : undefined}
                  className={`relative h-1.5 overflow-hidden rounded-full transition-all duration-500 ${active ? "w-10 bg-blue-950/15" : "w-1.5 bg-blue-950/25 hover:bg-blue-950/50"}`}
                >
                  {active && (
                    <span
                      key={selected}
                      className="hero-dot-fill absolute inset-0 origin-left rounded-full bg-blue-950"
                      style={
                        {
                          "--hero-interval": `${INTERVAL_MS}ms`,
                        } as React.CSSProperties
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
