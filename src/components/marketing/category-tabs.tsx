"use client";

import { useId, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export type CategoryTab = { id: string; label: string; content: ReactNode };

// Pestañas accesibles (patrón WAI-ARIA): flechas para moverse entre ellas.
export function CategoryTabs({ tabs }: { tabs: CategoryTab[] }) {
  const [active, setActive] = useState(0);
  const base = useId();
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: active + 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: tabs.length - 1,
    };
    if (!(event.key in keys)) return;
    event.preventDefault();
    const next = (keys[event.key] + tabs.length) % tabs.length;
    setActive(next);
    document.getElementById(`${base}-tab-${next}`)?.focus();
  };
  if (tabs.length === 1) return <>{tabs[0].content}</>;
  return (
    <div>
      <div
        role="tablist"
        aria-label="Categorías"
        onKeyDown={onKeyDown}
        className="-mx-1 mt-6 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
      >
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            id={`${base}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={`${base}-panel-${i}`}
            tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}
            className="shrink-0 rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:text-slate-900 aria-selected:border-blue-950 aria-selected:bg-blue-950 aria-selected:text-white"
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div
          key={tab.id}
          id={`${base}-panel-${i}`}
          role="tabpanel"
          aria-labelledby={`${base}-tab-${i}`}
          hidden={i !== active}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
}
