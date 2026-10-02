// El formato no prueba existencia: Supabase debe confirmar el correo.
export function isValidEmail(value: string): boolean {
  const email = value.trim();
  if (
    email.length > 254 ||
    !/^[A-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?(?:\.[A-Z0-9](?:[A-Z0-9-]*[A-Z0-9])?)+$/i.test(
      email,
    )
  )
    return false;
  const local = email.split("@")[0];
  return (
    local.length <= 64 &&
    !local.startsWith(".") &&
    !local.endsWith(".") &&
    !local.includes("..")
  );
}

export const passwordRules = [
  {
    label: "Al menos 8 caracteres",
    test: (value: string) => value.length >= 8,
  },
  {
    label: "Una letra mayúscula",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Una letra minúscula",
    test: (value: string) => /[a-z]/.test(value),
  },
  { label: "Un número", test: (value: string) => /[0-9]/.test(value) },
  {
    label: "Un carácter especial",
    test: (value: string) => /[^A-Za-z0-9\s]/.test(value),
  },
] as const;

export function isStrongPassword(value: string): boolean {
  return value.length <= 128 && passwordRules.every((rule) => rule.test(value));
}

export function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function safeNext(value: string | null, fallback = "/cuenta"): string {
  // Solo destinos internos conocidos; bloquea redirecciones abiertas.
  return value === "/cuenta" || value === "/auth/actualizar-clave"
    ? value
    : fallback;
}
