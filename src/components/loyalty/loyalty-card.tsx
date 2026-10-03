"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Check, Plus, Gift } from "lucide-react";
import {
  accrue,
  crc,
  demoMember,
  visibleStamps,
  type Member,
  type Reward,
} from "@/lib/loyalty";
import { enrollLoyalty } from "@/app/fidelidad/actions";

export function LoyaltyCard({
  member,
  rewards,
  qr,
  demo,
  walletReady,
  terms,
  version,
  enabled,
  accumulate,
}: {
  member: Member | null;
  rewards: Reward[];
  qr: string | null;
  demo: boolean;
  walletReady: boolean;
  terms: string;
  version: number;
  enabled: boolean;
  accumulate: boolean;
}) {
  const [sample, setSample] = useState(demoMember);
  const [sampleRewards, setSampleRewards] = useState(0);
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();
  const card = demo ? sample : member;
  const available = demo
    ? sampleRewards
    : rewards.filter((r) => !r.redeemed_at).length;
  const filled = visibleStamps(card?.total_stamps ?? 0, available);
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-700 to-blue-950 p-6 text-white shadow-xl shadow-blue-950/15 sm:p-9">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-3xl font-bold tracking-tight">
                Farma<span className="text-green-400">cova</span>
              </p>
              <p className="mt-1 text-[10px] tracking-[.25em] text-blue-200">
                CUIDAMOS DE TI
              </p>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-2 text-xs">
              Cliente frecuente
            </span>
          </div>
          <p className="mt-8 text-xl font-semibold">
            {card?.display_name ?? "Tu próxima recompensa empieza aquí"}
          </p>
          <p className="mt-2 text-sm text-blue-100">
            Un sello por cada ₡10.000 en compras
          </p>
          <div
            aria-label={`${filled} de 6 espacios completados`}
            className="my-8 grid grid-cols-3 gap-3 sm:grid-cols-6"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                aria-label={`Sello ${i + 1}: ${i < filled ? "completado" : "pendiente"}`}
                className={`flex aspect-square items-center justify-center rounded-2xl border ${i < filled ? "border-green-400 bg-green-500 text-white" : "border-white/25 bg-white/5 text-blue-200"}`}
              >
                {i < filled ? (
                  <Check size={28} aria-hidden="true" />
                ) : (
                  <span className="text-xl">{i + 1}</span>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-white/20 pt-5">
            <div>
              <p className="text-xs text-blue-200">TU BENEFICIO</p>
              <p className="mt-1 text-3xl font-bold">
                15%{" "}
                <span className="text-sm font-normal text-blue-100">
                  en una compra
                </span>
              </p>
            </div>
            <Gift className="text-green-400" size={35} aria-hidden="true" />
          </div>
          {card && (
            <p className="mt-5 break-all font-mono text-[10px] text-blue-200">
              {card.member_number}
            </p>
          )}
        </div>
        {demo && (
          <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900">
            <p className="font-bold">Prueba cómo se completa la tarjeta</p>
            <p className="mt-2">
              Esta simulación se reinicia al salir; no genera cupones reales.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                className="btn-secondary"
                onClick={() => {
                  const next = accrue(
                    sample.total_stamps,
                    sample.remainder_cents,
                    1_000_000,
                    accumulate,
                  );
                  setSample({
                    ...sample,
                    total_stamps: next.total,
                    remainder_cents: next.remainder,
                  });
                  setSampleRewards(sampleRewards + next.rewards);
                }}
              >
                <Plus size={16} /> Simular ₡10.000
              </button>
              <button
                className="text-sm underline"
                onClick={() => {
                  setSample(demoMember);
                  setSampleRewards(0);
                }}
              >
                Reiniciar
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="py-2">
        <span className="eyebrow">Club Farmacova</span>
        <h2 className="mt-3 text-3xl font-bold leading-tight text-blue-950">
          Tus compras te acercan
          <br />a tu próximo beneficio.
        </h2>
        <p className="mt-5 leading-relaxed text-slate-600">
          Completa los seis sellos y recibe un cupón del 15% de descuento para
          una compra posterior en la farmacia. El equipo de sucursal registra
          tus compras y valida el canje.
        </p>
        <p className="mt-3 text-sm text-slate-500">
          {accumulate
            ? "Las compras pequeñas se acumulan: dos compras de ₡5.000 completan un sello."
            : "Cada compra genera un sello por cada ₡10.000 completos; el resto no se acumula."}{" "}
          Los sellos adicionales comienzan tu próxima tarjeta.
        </p>
        {!enabled && (
          <p
            role="status"
            className="mt-5 rounded-xl bg-amber-50 p-4 text-amber-900"
          >
            Las nuevas inscripciones y la acumulación están pausadas. Los
            cupones existentes se validan en sucursal.
          </p>
        )}
        {card ? (
          <>
            <div
              role="status"
              className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-5"
            >
              <p className="font-bold text-green-900">
                {available > 0
                  ? `${available} ${available === 1 ? "cupón disponible" : "cupones disponibles"} del 15%`
                  : `${filled} de 6 sellos completados`}
              </p>
              {accumulate && card.remainder_cents > 0 && (
                <p className="mt-2 text-sm text-green-800">
                  Acumulado hacia tu siguiente sello:{" "}
                  {crc(card.remainder_cents / 100)}
                </p>
              )}
              {!card.active && (
                <p className="mt-2 text-red-800">
                  Tu tarjeta está suspendida. Contacta con la sucursal.
                </p>
              )}
            </div>
            {qr && (
              <div className="mt-5 flex items-center gap-5">
                <Image
                  src={qr}
                  alt="Código QR de tu tarjeta de fidelidad"
                  width={120}
                  height={120}
                  unoptimized
                />
                <p className="max-w-48 text-sm text-slate-500">
                  Muestra este código en sucursal para identificar tu tarjeta.
                  El descuento lo valida un administrador.
                </p>
              </div>
            )}
            {walletReady && !demo && card.active ? (
              <a href="/api/wallet/farmacova" className="btn-secondary mt-6">
                Agregar a Apple Wallet
              </a>
            ) : (
              <button
                disabled
                className="mt-6 inline-flex items-center gap-3 rounded-xl bg-slate-200 px-5 py-3 font-semibold text-slate-500"
              >
                {card.active
                  ? "Apple Wallet · Próximamente"
                  : "Tarjeta suspendida"}
              </button>
            )}
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              {walletReady
                ? "Después de una compra o canje, descarga nuevamente la tarjeta para actualizar los sellos en Wallet. En esta página siempre verás tu saldo actual."
                : "La descarga estará disponible cuando Farmacova active sus certificados de Apple Wallet."}
            </p>
          </>
        ) : (
          <form
            className="mt-7"
            onSubmit={(e) => {
              e.preventDefault();
              setError("");
              start(async () => {
                const result = await enrollLoyalty(name, version, accepted);
                setError(result.error ?? "");
              });
            }}
          >
            <label className="field-label" htmlFor="member-name">
              Nombre en tu tarjeta
            </label>
            <input
              id="member-name"
              className="field"
              value={name}
              onChange={(e) => setName(e.target.value)}
              minLength={2}
              maxLength={100}
              autoComplete="name"
              required
            />
            <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
              <input
                type="checkbox"
                className="mt-1"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                required
              />
              Acepto las condiciones del Club Farmacova que se muestran en esta
              página.
            </label>
            <button className="btn-primary mt-5" disabled={pending || !enabled}>
              {pending ? "Creando tarjeta…" : "Crear mi tarjeta gratuita"}
            </button>
            {error && (
              <p role="alert" className="field-error">
                {error}
              </p>
            )}
          </form>
        )}
        <details className="mt-6 border-t border-slate-200 pt-5">
          <summary className="text-sm font-semibold text-blue-900">
            Condiciones del programa
          </summary>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            6 sellos de ₡10.000 otorgan un cupón de 15% para una compra
            posterior. Cada cupón se usa una sola vez, en sucursal. Un cupón por
            factura. Sin caducidad automática.{terms ? `\n\n${terms}` : ""}
          </p>
        </details>
      </div>
    </div>
  );
}
