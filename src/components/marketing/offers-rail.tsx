"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function OffersRail({
  children,
  count,
}: {
  children: ReactNode;
  count: number;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  useEffect(() => {
    const element = rail.current;
    if (!element) return;
    const update = () => {
      setAtStart(element.scrollLeft <= 1);
      setAtEnd(
        element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
      );
    };
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [count]);
  const move = (direction: number) => {
    const element = rail.current;
    if (!element) return;
    const card = element.firstElementChild as HTMLElement | null;
    element.scrollBy({
      left: direction * ((card?.offsetWidth ?? element.clientWidth) + 20),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  };
  return (
    <div className="relative mt-6">
      <div
        ref={rail}
        role="region"
        aria-label="Ofertas del mes, desliza para ver más"
        tabIndex={0}
        onScroll={(event) => {
          const element = event.currentTarget;
          setAtStart(element.scrollLeft <= 1);
          setAtEnd(
            element.scrollLeft + element.clientWidth >= element.scrollWidth - 1,
          );
        }}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            move(event.key === "ArrowRight" ? 1 : -1);
          }
        }}
        className={`offers-rail flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 *:shrink-0 *:snap-start ${count <= 2 ? "*:basis-[88%] sm:*:basis-[calc((100%_-_20px)/2)]" : "*:basis-[88%] sm:*:basis-[calc((100%_-_20px)/2)] lg:*:basis-[calc((100%_-_40px)/3)]"}`}
      >
        {children}
      </div>
      <div
        className="mt-3 flex justify-end gap-2"
        aria-label="Controles de ofertas"
      >
        <button
          type="button"
          onClick={() => move(-1)}
          disabled={atStart}
          aria-label="Ofertas anteriores"
          className="rounded-full bg-blue-950 p-2.5 text-white hover:bg-blue-800 disabled:opacity-30"
        >
          <ChevronLeft size={21} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          disabled={atEnd}
          aria-label="Siguientes ofertas"
          className="rounded-full bg-blue-950 p-2.5 text-white hover:bg-blue-800 disabled:opacity-30"
        >
          <ChevronRight size={21} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
