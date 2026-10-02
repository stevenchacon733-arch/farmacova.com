import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeCampaigns,
  demoCampaigns,
  parsePreviewCampaigns,
  safeCampaignHref,
  validateCampaign,
} from "../src/lib/campaigns.ts";

test("campañas: respetar vigencia, estado y orden", () => {
  const now = Date.parse("2026-10-01T18:00:00Z");
  const items = [
    { ...demoCampaigns[0], position: 3 },
    { ...demoCampaigns[1], position: 1 },
    { ...demoCampaigns[2], active: false },
  ];
  assert.deepEqual(
    activeCampaigns(items, now).map((item) => item.position),
    [1, 3],
  );
  assert.equal(activeCampaigns(items, Date.parse("2100-01-01")).length, 0);
});
test("campañas: no admitir enlaces externos ni datos locales malformados", () => {
  assert.equal(safeCampaignHref("/catalogo/tioflex"), true);
  for (const href of [
    "//otro.com",
    "https://otro.com",
    "/auth",
    "/catalogo\\otro",
  ])
    assert.equal(safeCampaignHref(href), false);
  assert.deepEqual(
    parsePreviewCampaigns("{malformado", demoCampaigns),
    demoCampaigns,
  );
  assert.deepEqual(
    parsePreviewCampaigns(
      JSON.stringify([{ ...demoCampaigns[0], cta_href: "//otro.com" }]),
      demoCampaigns,
    ),
    demoCampaigns,
  );
});
test("campañas: validar el patrocinador, fechas y posición antes de guardar", () => {
  assert.equal(validateCampaign(demoCampaigns[0]), null);
  assert.ok(validateCampaign({ ...demoCampaigns[0], sponsor: "" }));
  assert.ok(
    validateCampaign({
      ...demoCampaigns[0],
      ends_at: demoCampaigns[0].starts_at,
    }),
  );
  assert.ok(validateCampaign({ ...demoCampaigns[0], position: 0 }));
});
