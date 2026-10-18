"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  accrue,
  amountToCents,
  crc,
  demoMember,
  POINTS_TARGET,
  visiblePoints,
  type Member,
  type Reward,
  type Purchase,
} from "@/lib/loyalty";
import {
  recordPurchase,
  redeemReward,
  setMemberActive,
} from "@/app/administracion/actions";

export function CustomerManager({
  members,
  rewards,
  purchases,
  demo,
  accumulate,
  earnOnRedemption,
}: {
  members: Member[];
  rewards: Reward[];
  purchases: Purchase[];
  demo: boolean;
  accumulate: boolean;
  earnOnRedemption: boolean;
}) {
  const router = useRouter();
  const [sample, setSample] = useState<Member>({
    ...demoMember,
    display_name: "Cliente de demostración",
  });
  const [sampleRewards, setSampleRewards] = useState<Reward[]>([]);
  const [samplePurchases, setSamplePurchases] = useState<Purchase[]>([]);
  const rows = demo ? [sample] : members;
  const [selected, setSelected] = useState(rows[0]?.id ?? "");
  const member = rows.find((row) => row.id === selected);
  const allRewards = demo ? sampleRewards : rewards;
  const allPurchases = demo ? samplePurchases : purchases;
  const customerRewards = allRewards.filter(
    (row) => row.member_id === selected,
  );
  const customerPurchases = allPurchases.filter(
    (row) => row.member_id === selected,
  );
  const available = customerRewards.filter((row) => !row.redeemed_at);
  const [amount, setAmount] = useState(""),
    [receipt, setReceipt] = useState(""),
    [mode, setMode] = useState("purchase"),
    [rewardId, setRewardId] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [operation, setOperation] = useState<{ key: string; id: string } | null>(
      null,
    );
  const [pending, start] = useTransition();
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setError("");
    setMessage("");
    const operationKey = JSON.stringify([
      selected,
      mode,
      amount,
      receipt,
      rewardId,
    ]);
    const requestId =
      operation?.key === operationKey ? operation.id : crypto.randomUUID();
    setOperation({ key: operationKey, id: requestId });
    start(async () => {
      try {
        const cents = amountToCents(amount);
        if (!receipt.trim() || receipt.trim().length > 100)
          throw new Error("Ingresa el número de factura.");
        if (demo) {
          const reference = receipt.trim().toUpperCase();
          if (
            customerPurchases.some((row) => row.receipt === reference) ||
            customerRewards.some((row) => row.redemption_receipt === reference)
          )
            throw new Error(
              "La factura ya fue registrada. Usa una factura nueva.",
            );
          if (!member.active)
            throw new Error("Esta cuenta Cova Puntos está suspendida.");
          const reward = available.find((row) => row.id === rewardId);
          if (mode === "redeem" && !reward)
            throw new Error("Selecciona un cupón disponible.");
          const discount =
            mode === "redeem" ? Math.round((cents * 15) / 100) : 0;
          const credit =
            mode === "redeem" && !earnOnRedemption ? 0 : cents - discount;
          const next =
            credit > 0
              ? accrue(
                  sample.total_stamps,
                  sample.remainder_cents,
                  credit,
                  accumulate,
                )
              : {
                  total: sample.total_stamps,
                  remainder: sample.remainder_cents,
                  added: 0,
                  rewards: 0,
                };
          setSample({
            ...sample,
            total_stamps: next.total,
            remainder_cents: next.remainder,
          });
          const nextRewards = [...sampleRewards];
          if (reward) {
            const i = nextRewards.findIndex((row) => row.id === reward.id);
            nextRewards[i] = {
              ...reward,
              redeemed_at: new Date().toISOString(),
              redemption_receipt: reference,
            };
          }
          for (let i = 0; i < next.rewards; i++)
            nextRewards.push({
              id: crypto.randomUUID(),
              member_id: sample.id,
              cycle: Math.floor(sample.total_stamps / POINTS_TARGET) + i + 1,
              created_at: new Date().toISOString(),
              redeemed_at: null,
              redemption_receipt: null,
            });
          setSampleRewards(nextRewards);
          setSamplePurchases([
            {
              id: requestId,
              member_id: sample.id,
              receipt: reference,
              amount_cents: cents - discount,
              stamps_added: next.added,
              created_at: new Date().toISOString(),
            },
            ...samplePurchases,
          ]);
          setMessage(
            mode === "redeem"
              ? `Canje simulado: ${crc(discount / 100)} de descuento. ${next.added} Cova Puntos añadidos.`
              : `Compra simulada: ${next.added} Cova Puntos añadidos.`,
          );
        } else {
          const result =
            mode === "redeem"
              ? await redeemReward(rewardId, amount, receipt, requestId)
              : await recordPurchase(selected, amount, receipt, requestId);
          if (result.error) throw new Error(result.error);
          setMessage(result.message ?? "Operación guardada.");
          router.refresh();
        }
        setAmount("");
        setReceipt("");
        if (mode === "redeem") {
          setMode("purchase");
          setRewardId("");
        }
        setOperation(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "No pudimos registrar la operación.",
        );
      }
    });
  }
  return (
    <>
      <div className="mt-7 grid gap-6 lg:grid-cols-[.85fr_1.6fr]">
        <div className="space-y-3">
          {rows.map((row) => (
            <button
              key={row.id}
              className={`w-full rounded-2xl border p-5 text-left ${selected === row.id ? "border-blue-700 bg-blue-50" : "border-slate-200"}`}
              onClick={() => {
                setSelected(row.id);
                setError("");
                setMessage("");
                setRewardId("");
                setMode("purchase");
                setReceipt("");
                setAmount("");
              }}
            >
              <span className="block font-bold text-blue-950">
                {row.display_name}
              </span>
              <span className="mt-2 block break-all font-mono text-[10px] text-slate-500">
                {row.member_number}
              </span>
              <span className="mt-2 block text-xs text-green-800">
                {row.active ? "Cuenta activa" : "Suspendida"}
              </span>
            </button>
          ))}
          {rows.length === 0 && (
            <p className="rounded-2xl bg-slate-50 p-6 text-slate-500">
              No hay clientes inscritos con esta búsqueda.
            </p>
          )}
        </div>
        {member && (
          <div>
            <div className="rounded-3xl bg-blue-900 p-6 text-white">
              <p className="text-xl font-bold">{member.display_name}</p>
              <p className="mt-5 text-3xl font-bold">
                {visiblePoints(member.total_stamps, available.length)}
                <span className="text-base font-normal text-blue-200">
                  {" "}
                  / {POINTS_TARGET} puntos
                </span>
              </p>
              <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{
                    width: `${(visiblePoints(member.total_stamps, available.length) / POINTS_TARGET) * 100}%`,
                  }}
                />
              </div>
              <p className="mt-5 text-sm text-blue-100">
                {available.length} cupones del 15% disponibles ·{" "}
                {member.total_stamps} puntos históricos
              </p>
              {accumulate && (
                <p className="mt-2 text-sm text-blue-100">
                  Acumulado hacia el siguiente punto:{" "}
                  {crc(member.remainder_cents / 100)}
                </p>
              )}
            </div>
            <form
              onSubmit={submit}
              className="mt-6 rounded-3xl border border-slate-200 p-6"
            >
              <h2 className="text-xl font-bold text-blue-950">
                Registrar en sucursal
              </h2>
              <label htmlFor="operation-mode" className="field-label mt-5">
                Operación
              </label>
              <select
                id="operation-mode"
                className="field"
                value={mode}
                onChange={(e) => {
                  setMode(e.target.value);
                  setError("");
                  setMessage("");
                }}
              >
                <option value="purchase">
                  Registrar compra y sumar puntos
                </option>
                <option value="redeem" disabled={!available.length}>
                  Canjear un cupón del 15%
                </option>
              </select>
              {mode === "redeem" && (
                <>
                  <label htmlFor="coupon" className="field-label mt-5">
                    Cupón disponible
                  </label>
                  <select
                    id="coupon"
                    className="field"
                    value={rewardId}
                    onChange={(e) => setRewardId(e.target.value)}
                    required
                  >
                    <option value="">Seleccionar cupón</option>
                    {available.map((reward) => (
                      <option key={reward.id} value={reward.id}>
                        Cupón #{reward.cycle} · 15%
                      </option>
                    ))}
                  </select>
                </>
              )}
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="receipt" className="field-label">
                    Factura{" "}
                    {mode === "redeem" ? "de la nueva compra" : "de compra"}
                  </label>
                  <input
                    id="receipt"
                    className="field"
                    value={receipt}
                    onChange={(e) => setReceipt(e.target.value)}
                    maxLength={100}
                    required
                    placeholder="Sucursal + número de factura"
                  />
                </div>
                <div>
                  <label htmlFor="purchase-amount" className="field-label">
                    {mode === "redeem"
                      ? "Importe antes del descuento (₡)"
                      : "Importe pagado (₡)"}
                  </label>
                  <input
                    id="purchase-amount"
                    type="number"
                    className="field"
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="10000"
                  />
                </div>
              </div>
              {mode === "redeem" && Number(amount) > 0 && (
                <p className="mt-4 font-bold text-green-700">
                  15% de descuento: {crc(Math.round(Number(amount) * 15) / 100)}
                </p>
              )}
              <p className="mt-4 text-xs text-slate-500">
                Verifica la factura antes de confirmar. Una factura solo puede
                registrarse una vez.{" "}
                {mode === "redeem"
                  ? earnOnRedemption
                    ? "Se acumulan puntos sobre el importe después del descuento."
                    : "Las compras de canje no acumulan puntos."
                  : "Las operaciones quedan en el historial."}
              </p>
              <button
                type="submit"
                className="btn-primary mt-5"
                disabled={pending || !member.active}
              >
                {pending
                  ? "Registrando…"
                  : mode === "redeem"
                    ? "Confirmar canje único"
                    : "Confirmar compra"}
              </button>
              {error && (
                <p className="field-error" role="alert">
                  {error}
                </p>
              )}
              {message && (
                <p
                  role="status"
                  className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800"
                >
                  {message}
                </p>
              )}
            </form>
            <details className="mt-5 rounded-2xl border border-slate-200 p-5">
              <summary className="font-semibold text-blue-950">
                Compras y cupones recientes
              </summary>
              <div className="mt-4 space-y-3">
                {customerPurchases.map((row) => (
                  <p key={row.id} className="text-sm text-slate-600">
                    Factura {row.receipt} · {crc(row.amount_cents / 100)} ·{" "}
                    {row.stamps_added} puntos
                  </p>
                ))}
                {customerRewards.map((row) => (
                  <p key={row.id} className="text-sm text-green-800">
                    Cupón #{row.cycle}:{" "}
                    {row.redeemed_at
                      ? `Canjeado · Factura ${row.redemption_receipt}`
                      : "Disponible · 15%"}
                  </p>
                ))}
                {!customerPurchases.length && !customerRewards.length && (
                  <p className="text-sm text-slate-500">
                    Sin movimientos todavía.
                  </p>
                )}
              </div>
            </details>
            <button
              className="mt-5 text-sm font-semibold text-slate-500 underline"
              disabled={pending}
              onClick={() => {
                if (
                  !confirm(
                    member.active
                      ? "¿Suspender esta cuenta? No podrá acumular ni canjear hasta reactivarla."
                      : "¿Reactivar esta cuenta?",
                  )
                )
                  return;
                start(async () => {
                  if (demo) setSample({ ...sample, active: !sample.active });
                  else {
                    const result = await setMemberActive(
                      member.id,
                      !member.active,
                    );
                    if (result.error) setError(result.error);
                    else router.refresh();
                  }
                });
              }}
            >
              {member.active ? "Suspender cuenta" : "Reactivar cuenta"}
            </button>
          </div>
        )}
      </div>
      {demo && (
        <p className="mt-6 text-xs text-amber-900">
          El cliente y las operaciones de esta sección son una simulación. Se
          reinician al salir del panel.
        </p>
      )}
    </>
  );
}
