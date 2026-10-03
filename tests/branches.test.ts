import test from "node:test";
import assert from "node:assert/strict";
import {
  initialBranches,
  mapsHref,
  phoneHref,
  safeBranchUrl,
} from "../src/lib/branches.ts";
import { validateRecord } from "../src/lib/admin-validation.ts";

test("sucursales: conservar teléfonos independientes y enlaces del propietario", () => {
  const sanGabriel = initialBranches[1];
  const valid = validateRecord("sucursales", sanGabriel);
  assert.equal(
    "secondary_phone" in valid && valid.secondary_phone,
    "6077-5505",
  );
  assert.equal(phoneHref(sanGabriel.phone), "tel:+50624742505");
  assert.equal(phoneHref(sanGabriel.secondary_phone!), "tel:+50660775505");
  assert.equal(mapsHref(initialBranches[0]), initialBranches[0].maps_url);
  assert.equal(initialBranches[0].hours, "9:00 a. m. a 9:00 p. m.");
  assert.equal(initialBranches[4].hours, "9:00 a. m. a 9:00 p. m.");
  assert.ok(
    initialBranches
      .slice(1, 4)
      .every((branch) => branch.hours === "8:00 a. m. a 8:00 p. m."),
  );
  const searched = new URL(mapsHref(sanGabriel));
  assert.ok(searched.searchParams.get("query")?.includes("9MG6+345"));
});

test("sucursales: bloquear protocolos y dominios engañosos sin romper registros antiguos", () => {
  assert.equal(safeBranchUrl(initialBranches[0].waze_url!, "waze"), true);
  for (const url of [
    "javascript:alert(1)",
    "https://google.com.evil.test/maps",
    "https://google.com@evil.test/maps",
    "http://www.google.com/maps",
  ]) {
    assert.equal(safeBranchUrl(url, "maps"), false);
    assert.throws(() =>
      validateRecord("sucursales", { ...initialBranches[0], maps_url: url }),
    );
  }
  const { secondary_phone, maps_url, waze_url, facebook_url, ...legacy } =
    initialBranches[0];
  void secondary_phone;
  void maps_url;
  void waze_url;
  void facebook_url;
  const valid = validateRecord("sucursales", legacy);
  assert.equal("maps_url" in valid && valid.maps_url, "");
});
