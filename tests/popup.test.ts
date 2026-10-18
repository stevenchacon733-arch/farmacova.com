import { test } from "node:test";
import assert from "node:assert/strict";
import {
  currentPopup,
  demoPopup,
  parsePreviewPopups,
  safePopupImage,
  validatePopup,
} from "../src/lib/popup.ts";

test("pop-up: validar campos, fechas e imagen al publicar", () => {
  assert.equal(validatePopup(demoPopup), null);
  assert.match(validatePopup({ ...demoPopup, sponsor: "" })!, /patrocinador/);
  assert.match(
    validatePopup({ ...demoPopup, ends_at: demoPopup.starts_at })!,
    /posterior/,
  );
  assert.match(validatePopup({ ...demoPopup, image_path: null })!, /imagen/);
  assert.equal(
    validatePopup({ ...demoPopup, image_path: null, active: false }),
    null,
  );
});

test("pop-up: elegir el vigente más reciente", () => {
  const now = Date.parse("2026-10-18T12:00:00Z");
  const older = { ...demoPopup, id: "a", starts_at: "2026-10-01T00:00:00Z" };
  const newer = { ...demoPopup, id: "b", starts_at: "2026-10-10T00:00:00Z" };
  const future = { ...demoPopup, id: "c", starts_at: "2026-11-01T00:00:00Z" };
  const off = { ...newer, id: "d", active: false };
  assert.equal(currentPopup([older, newer, future, off], now)?.id, "b");
  assert.equal(currentPopup([future, off], now), null);
});

test("pop-up: solo imágenes seguras", () => {
  const base = "https://abc.supabase.co";
  const ok = `${base}/storage/v1/object/public/campaign-images/u/i.png`;
  assert.equal(safePopupImage("/images/a.webp", base), "/images/a.webp");
  assert.equal(safePopupImage(ok, base), ok);
  assert.equal(safePopupImage("https://evil.example/x.png", base), null);
  assert.equal(safePopupImage("javascript:alert(1)", base), null);
  assert.equal(safePopupImage("data:image/png;base64,AAAA", base), null);
  assert.equal(
    safePopupImage("data:image/png;base64,AAAA", base, true),
    "data:image/png;base64,AAAA",
  );
});

test("pop-up: vista previa local inválida vuelve al original", () => {
  assert.deepEqual(parsePreviewPopups("{roto", [demoPopup]), [demoPopup]);
  assert.deepEqual(parsePreviewPopups("[]", [demoPopup]), [demoPopup]);
  const edited = { ...demoPopup, headline: "Nuevo" };
  assert.deepEqual(parsePreviewPopups(JSON.stringify([edited]), [demoPopup]), [
    edited,
  ]);
});
