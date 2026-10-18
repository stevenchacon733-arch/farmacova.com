import test from "node:test";
import assert from "node:assert/strict";
import { accrue, amountToCents, visiblePoints } from "../src/lib/loyalty.ts";
import { validateRecord } from "../src/lib/admin-validation.ts";
test("dos compras de quinientos suman un punto sin perder céntimos", () => {
  const first = accrue(0, 0, amountToCents("500.25"));
  const next = accrue(first.total, first.remainder, amountToCents("499.75"));
  assert.equal(next.total, 1);
  assert.equal(next.remainder, 0);
});
test("60 puntos emiten un cupón y el exceso inicia un nuevo ciclo", () => {
  const result = accrue(55, 0, amountToCents("20000"));
  assert.deepEqual(result, { added: 20, total: 75, remainder: 0, rewards: 1 });
  assert.equal(visiblePoints(60, 1), 60);
  assert.equal(visiblePoints(75, 1), 15);
  assert.equal(visiblePoints(60, 0), 0);
});
test("la acumulación por factura y las cantidades monetarias son estrictas", () => {
  assert.equal(accrue(0, 0, amountToCents("500"), false).remainder, 0);
  for (const value of [
    "-100",
    "0",
    "1000.001",
    "1e6",
    "10,000",
    "Infinity",
    "1000001",
  ])
    assert.throws(() => amountToCents(value));
});
test("el servidor solo guarda campos permitidos y condiciones válidas", () => {
  const valid = validateRecord("configuracion", {
    loyalty_enabled: true,
    accumulate_remainder: true,
    earn_on_redemption: true,
    loyalty_terms: "",
    program_version: 999,
    role: "admin",
  });
  assert.equal("role" in valid, false);
  assert.equal("program_version" in valid && valid.program_version, 1);
  assert.throws(() =>
    validateRecord("configuracion", { loyalty_enabled: "true" }),
  );
});
