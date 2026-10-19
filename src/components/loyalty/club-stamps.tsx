import Link from "next/link";
import { ArrowRight, Check, Gift } from "lucide-react";
import { REWARD_PERCENT, STAMP_CENTS, STAMP_TARGET } from "@/lib/loyalty";

// Tarjeta visual del Club Farmacova. Lee las reglas de src/lib/loyalty.ts,
// así que se ajusta sola si cambian la meta, el monto o el descuento.
export function ClubStamps({ filled = 3 }: { filled?: number }) {
  const stamps = Array.from({ length: STAMP_TARGET }, (_, i) => i + 1);
  return (
    <section
      aria-labelledby="club-title"
      className="overflow-hidden rounded-3xl bg-blue-950 text-white"
    >
      <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:gap-16 lg:p-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-green-300">
            Club Farmacova
          </p>
          <h2
            id="club-title"
            className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl"
          >
            Completa {STAMP_TARGET} sellos = {REWARD_PERCENT}% desc.
          </h2>
          <p className="mt-2 text-sm text-blue-200">
            1 sello por cada ₡{(STAMP_CENTS / 100).toLocaleString("de-DE")} en
            compras.
          </p>
          <Link
            href="/fidelidad"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500 px-5 py-3 text-sm font-semibold text-blue-950 transition hover:bg-green-400"
          >
            Obtener mi tarjeta <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
        <figure>
          <ol
            aria-label={`Ejemplo de tarjeta con ${filled} de ${STAMP_TARGET} sellos`}
            className="grid grid-cols-3 gap-3 sm:gap-4"
          >
            {stamps.map((n) => {
              const reward = n === STAMP_TARGET;
              const done = n <= filled;
              return (
                <li
                  key={n}
                  style={{ animationDelay: `${n * 90}ms` }}
                  className={`club-stamp flex aspect-square w-20 flex-col items-center justify-center rounded-2xl border-2 text-xs font-semibold sm:w-24 ${
                    reward
                      ? "border-green-400 bg-green-400/10 text-green-300"
                      : done
                        ? "border-transparent bg-white text-blue-900"
                        : "border-dashed border-white/25 text-blue-200"
                  }`}
                >
                  {reward ? (
                    <>
                      <Gift size={26} strokeWidth={1.6} aria-hidden="true" />
                      <span className="mt-1">−{REWARD_PERCENT}%</span>
                    </>
                  ) : done ? (
                    <>
                      <Check size={26} strokeWidth={2.2} aria-hidden="true" />
                      <span className="sr-only">Sello {n} completado</span>
                    </>
                  ) : (
                    <span className="text-lg">{n}</span>
                  )}
                </li>
              );
            })}
          </ol>
          <figcaption className="mt-4 flex items-center gap-3 text-xs text-blue-200">
            <span
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/15"
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full bg-green-400"
                style={{ width: `${(filled / STAMP_TARGET) * 100}%` }}
              />
            </span>
            {filled}/{STAMP_TARGET} sellos
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
