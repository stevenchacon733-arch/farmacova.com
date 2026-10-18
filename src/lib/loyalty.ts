// Montos expresados en céntimos: evita errores al sumar dinero con decimales.
// Cova Puntos: 1 punto por cada ₡1.000; 60 puntos dan un cupón del 15%.
export const PROGRAM_NAME = "Cova Puntos";
export const POINT_CENTS = 100_000;
export const POINTS_TARGET = 60;
export const REWARD_PERCENT = 15;
export function amountToCents(value: string): number {
  const normalized = value.trim();
  if (!/^\d{1,8}(\.\d{1,2})?$/.test(normalized))
    throw new Error("Escribe un monto válido, sin separadores de miles.");
  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (cents <= 0 || cents > 100_000_000)
    throw new Error("El monto debe estar entre ₡0,01 y ₡1.000.000.");
  return cents;
}
export function accrue(
  points: number,
  remainder: number,
  cents: number,
  accumulate = true,
) {
  if (
    ![points, remainder, cents].every(Number.isSafeInteger) ||
    points < 0 ||
    remainder < 0 ||
    remainder >= POINT_CENTS ||
    cents <= 0
  )
    throw new Error("Datos de compra inválidos.");
  const amount = cents + (accumulate ? remainder : 0);
  const added = Math.floor(amount / POINT_CENTS);
  const total = points + added;
  return {
    added,
    total,
    remainder: accumulate ? amount % POINT_CENTS : 0,
    rewards:
      Math.floor(total / POINTS_TARGET) - Math.floor(points / POINTS_TARGET),
  };
}
// Puntos del ciclo en curso; un ciclo completo se muestra lleno mientras haya cupón.
export function visiblePoints(total: number, available: number) {
  return total % POINTS_TARGET || (available > 0 ? POINTS_TARGET : 0);
}
export function crc(amount: number) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(amount);
}
export type Member = {
  id: string;
  user_id: string;
  member_number: string;
  display_name: string;
  total_stamps: number;
  remainder_cents: number;
  active: boolean;
  created_at: string;
};
export type Reward = {
  id: string;
  member_id: string;
  cycle: number;
  created_at: string;
  redeemed_at: string | null;
  redemption_receipt: string | null;
};
export type Purchase = {
  id: string;
  member_id: string;
  receipt: string;
  amount_cents: number;
  stamps_added: number;
  created_at: string;
};
export const demoMember: Member = {
  id: "11111111-1111-4111-8111-111111111111",
  user_id: "",
  member_number: "FC-DEMO-001",
  display_name: "Tu cuenta Cova Puntos",
  total_stamps: 0,
  remainder_cents: 0,
  active: true,
  created_at: "2026-10-01T00:00:00Z",
};
