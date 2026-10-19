# Seguridad de Farmacova

## Reportar un problema

Si encuentras una falla de seguridad, no abras un issue público. Usa
**Security → Report a vulnerability** en este repositorio o escribe a la
farmacia por los canales oficiales.

## Reglas del proyecto

- Ningún secreto va en el repositorio ni en variables `NEXT_PUBLIC_*`. Las
  claves privadas (Apple Wallet, SMTP) viven solo en Vercel o en Supabase.
- La clave `service_role` / `sb_secret_…` de Supabase **no** se usa en la web.
  El navegador solo recibe la clave publicable, y la base de datos se protege
  con RLS: cada tabla dice quién puede leer o escribir.
- Administrar exige `app_metadata.role = 'admin'` (solo se asigna desde
  Supabase) **y** verificación en dos pasos en esa sesión (`aal2`), tanto en
  la web como en la base de datos (`is_farmacova_admin`).
- Cambios a `main` entran por pull request con CI en verde.

Los pasos de configuración están en [SEGURIDAD.md](SEGURIDAD.md).
