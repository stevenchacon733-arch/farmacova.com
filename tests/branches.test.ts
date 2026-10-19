import test from "node:test";
import assert from "node:assert/strict";
import {
  branchCity,
  branchCoordinates,
  directionsHref,
  initialBranches,
  openNow,
  parseHours,
  wazeHref,
  mapsHref,
  phoneHref,
  safeBranchUrl,
  whatsappHref,
  whatsappNumber,
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

test("sucursales: WhatsApp usa el primer celular y omite teléfonos fijos", () => {
  const [aguasZarcas, sanGabriel, sanCarlos] = initialBranches;
  assert.equal(whatsappNumber(aguasZarcas), "50683750404");
  assert.equal(whatsappNumber(sanGabriel), "50660775505");
  assert.equal(whatsappNumber(sanCarlos), "50683368336");
  assert.equal(
    whatsappNumber({ ...sanCarlos, phone: "2460-0309", secondary_phone: "" }),
    null,
  );
  assert.equal(
    whatsappNumber({ ...sanCarlos, phone: "+506 8472 8472" }),
    "50684728472",
  );
  const href = new URL(whatsappHref(aguasZarcas)!);
  assert.equal(href.origin + href.pathname, "https://wa.me/50683750404");
  assert.ok(href.searchParams.get("text")?.includes("Farmacova Aguas Zarcas"));
});

test("sucursales: mapa, rutas y estado de apertura", () => {
  const [aguasZarcas, sanGabriel] = initialBranches;
  assert.ok(initialBranches.every((branch) => branchCoordinates(branch)));
  assert.deepEqual([...new Set(initialBranches.map(branchCity))].sort(), [
    "Aguas Zarcas",
    "Ciudad Quesada",
    "Pital",
    "Venecia",
  ]);
  assert.equal(branchCity({ ...sanGabriel, city: "" }), "Otras localidades");
  // Ruta: enlace del propietario si existe; si no, coordenadas del pin.
  assert.equal(directionsHref(aguasZarcas), aguasZarcas.maps_url);
  assert.equal(
    directionsHref(sanGabriel),
    "https://www.google.com/maps/dir/?api=1&destination=10.375188%2C-84.339688",
  );
  assert.equal(wazeHref(aguasZarcas), aguasZarcas.waze_url);
  assert.equal(
    wazeHref(sanGabriel),
    "https://waze.com/ul?ll=10.375188%2C-84.339688&navigate=yes",
  );
  assert.equal(wazeHref({ ...sanGabriel, latitude: null }), null);
  assert.deepEqual(parseHours("9:00 a. m. a 9:00 p. m."), {
    opens: 540,
    closes: 1260,
  });
  assert.deepEqual(parseHours("12:30 p. m. a 8 p.m."), {
    opens: 750,
    closes: 1200,
  });
  assert.equal(parseHours("Por confirmar"), null);
  // 15:00 UTC = 9:00 en Costa Rica.
  assert.equal(openNow(aguasZarcas, new Date("2026-10-19T15:00:00Z")), true);
  assert.equal(openNow(aguasZarcas, new Date("2026-10-19T14:59:00Z")), false);
  assert.equal(openNow(sanGabriel, new Date("2026-10-20T02:00:00Z")), false);
  assert.equal(openNow({ ...sanGabriel, hours: "" }, new Date()), null);
  const valid = validateRecord("sucursales", {
    ...sanGabriel,
    latitude: "10.4",
    longitude: "",
  });
  assert.ok("latitude" in valid && valid.latitude === 10.4);
  assert.ok("longitude" in valid && valid.longitude === null);
  assert.throws(
    () => validateRecord("sucursales", { ...sanGabriel, latitude: 40 }),
    /Latitud/,
  );
});
