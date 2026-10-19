import assert from "node:assert/strict";
import test from "node:test";
import { isActivePromotion, savingPercent } from "../src/lib/promotions.ts";

const start = "2026-10-01T06:00:00Z";
const end = "2026-11-01T06:00:00Z";
const promotion = {
  promotional: true,
  promotion_starts_at: start,
  promotion_ends_at: end,
};

test("las promociones mensuales respetan el inicio y el fin en Costa Rica", () => {
  assert.equal(isActivePromotion(promotion, Date.parse(start) - 1), false);
  assert.equal(isActivePromotion(promotion, Date.parse(start)), true);
  assert.equal(isActivePromotion(promotion, Date.parse(end) - 1), true);
  assert.equal(isActivePromotion(promotion, Date.parse(end)), false);
});

test("las campañas sin fechas requieren activación explícita", () => {
  assert.equal(isActivePromotion({ promotional: true }), true);
  assert.equal(isActivePromotion({ promotional: false }), false);
  assert.equal(
    isActivePromotion({ ...promotion, promotional: false }, Date.parse(start)),
    false,
  );
});

test("el ahorro solo se muestra con una oferta vigente y más barata", () => {
  const now = Date.parse(start) + 1;
  const priced = { ...promotion, price_crc: 10000, sale_price_crc: 8550 };
  assert.equal(savingPercent(priced, now), 14);
  assert.equal(savingPercent(priced, Date.parse(end)), 0);
  assert.equal(savingPercent({ ...priced, sale_price_crc: 12000 }, now), 0);
  assert.equal(savingPercent({ ...promotion, price_crc: 10000 }, now), 0);
});
