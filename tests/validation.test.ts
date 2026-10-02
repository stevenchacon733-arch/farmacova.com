import { test } from "node:test";
import assert from "node:assert/strict";
// Extensión explícita para el ejecutor nativo de Node; no depende de Next.
import {
  isValidEmail,
  isStrongPassword,
  normalizeSearch,
  safeNext,
} from "../src/lib/validation.ts";

test("correo: aceptar formato útil y rechazar direcciones malformadas", () => {
  for (const email of [
    "cliente@farmacova.cr",
    "ana+perfil@correo.co.cr",
    "  ana@correo.com  ",
  ])
    assert.equal(isValidEmail(email), true);
  for (const email of [
    "ana",
    "ana@",
    "ana@@correo.com",
    "ana@correo",
    "ana..ruiz@correo.com",
    ".ana@correo.com",
    "ana@-correo.com",
    "ana@correo..com",
    "ana @correo.com",
  ])
    assert.equal(isValidEmail(email), false, email);
});

test("contraseña: no permitir omitir ninguna condición ni usar espacios como símbolo", () => {
  assert.equal(isStrongPassword("Segura12!"), true);
  for (const password of [
    "Seg1!",
    "segura12!",
    "Seguraaa!",
    "Segura123",
    "Segura1 ",
    "A1!".repeat(50),
  ])
    assert.equal(isStrongPassword(password), false, password);
});

test("destinos de Auth: bloquear URLs externas y rutas no autorizadas", () => {
  assert.equal(safeNext("/cuenta"), "/cuenta");
  assert.equal(safeNext("/auth/actualizar-clave"), "/auth/actualizar-clave");
  for (const url of [
    "https://otro.example",
    "//otro.example",
    "/\\otro.example",
    "/catalogo",
    null,
  ])
    assert.equal(safeNext(url), "/cuenta");
});

test("búsqueda: normalizar acentos y espacios", () => {
  assert.equal(normalizeSearch("  ÁCIDO  "), "acido");
});
