// Montos expresados en céntimos: evita errores al sumar dinero con decimales.
export const STAMP_CENTS = 1_000_000;
export const STAMP_TARGET = 6;
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
  stamps: number,
  remainder: number,
  cents: number,
  accumulate = true,
) {
  if (
    ![stamps, remainder, cents].every(Number.isSafeInteger) ||
    stamps < 0 ||
    remainder < 0 ||
    remainder >= STAMP_CENTS ||
    cents <= 0
  )
    throw new Error("Datos de compra inválidos.");
  const amount = cents + (accumulate ? remainder : 0);
  const added = Math.floor(amount / STAMP_CENTS);
  const total = stamps + added;
  return {
    added,
    total,
    remainder: accumulate ? amount % STAMP_CENTS : 0,
    rewards:
      Math.floor(total / STAMP_TARGET) - Math.floor(stamps / STAMP_TARGET),
  };
}
export function visibleStamps(total: number, available: number) {
  return total % STAMP_TARGET || (available > 0 ? STAMP_TARGET : 0);
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
  display_name: "Tu tarjeta Farmacova",
  total_stamps: 0,
  remainder_cents: 0,
  active: true,
  created_at: "2026-10-01T00:00:00Z",
};
