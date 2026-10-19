# Seguridad y cuentas: pasos para activar

La web ya trae registro, ingreso, confirmación de correo, recuperación de
contraseña, verificación en dos pasos y un panel de administración protegido.
Esto es lo que falta hacer a mano, en orden.

## 1. Supabase (base de datos y cuentas)

1. Crea el proyecto en [supabase.com](https://supabase.com) (región más cercana: `us-east-1`).
2. **SQL Editor**: ejecuta en orden todos los archivos de `supabase/migrations/`
   (del `202610010001` al `202610190012`).
3. **Project Settings → API Keys**: copia la URL del proyecto y la clave
   **publicable** (`sb_publishable_…`). Esa clave es pública a propósito; la
   protección real son las reglas RLS de las migraciones.
   **Nunca** copies la clave secreta (`sb_secret_…` / `service_role`) a la web,
   a Vercel ni a GitHub.

## 2. Vercel (variables)

**Settings → Environment Variables**, para Production y Preview:

| Variable | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | clave publicable |
| `FARMACOVA_DEMO_MODE` | `false` (cuando todo esté listo) |

Las variables de Apple Wallet se marcan como **Sensitive**. Ninguna variable
privada lleva el prefijo `NEXT_PUBLIC_`, porque ese prefijo la envía al navegador.

## 3. Ajustes de cuentas en Supabase

**Authentication → Sign In / Providers → Email**
- Email activado, **Confirm email** activado.
- **Secure email change** y **Secure password change** activados.
- Contraseña mínima 8, con minúsculas, mayúsculas, números y símbolos.
- *Prevent use of leaked passwords*: actívalo si el plan lo permite (Pro).

**Authentication → URL Configuration**
- Site URL: `https://farmacova.com` (o `https://farmacova-com.vercel.app` mientras no haya dominio).
- Redirect URLs: `https://farmacova.com/auth/confirm`, `https://farmacova.com/auth/callback`
  y las mismas con `https://farmacova-com.vercel.app`.

**Authentication → Multi-Factor**: TOTP (app de autenticación) activado.

## 4. Correos automáticos

**Authentication → Emails → Templates**: pega el HTML de cada archivo y su asunto.

| Plantilla | Archivo | Asunto |
| --- | --- | --- |
| Confirm signup | `supabase/templates/confirmacion.html` | Confirma tu cuenta de Farmacova |
| Reset password | `supabase/templates/recuperacion.html` | Cambia tu contraseña de Farmacova |
| Change email address | `supabase/templates/cambio-correo.html` | Confirma tu nuevo correo en Farmacova |

**Envío (SMTP).** El correo incluido en Supabase solo sirve para pruebas: envía
muy pocos mensajes por hora y solo a miembros del equipo. Para clientes reales:

1. Crea una cuenta en [resend.com](https://resend.com) (plan gratis: 3.000 correos al mes).
2. **Domains → Add domain** `farmacova.com` y copia los registros DNS (SPF, DKIM)
   en el proveedor del dominio. Espera a que diga *Verified*.
3. **API Keys → Create** con permiso *Sending access*. Cópiala una sola vez.
4. En Supabase, **Authentication → Emails → SMTP Settings**: activar, host
   `smtp.resend.com`, puerto `465`, usuario `resend`, contraseña = la API key,
   remitente `no-reply@farmacova.com`, nombre `Farmacova`.
5. **Authentication → Rate Limits**: sube el límite de correos por hora (por ejemplo 100).

La API key de Resend se guarda solo en Supabase; no va en el código ni en Vercel.

## 5. Cuenta de administrador

1. Regístrate en la web con tu correo y confírmalo.
2. En el **SQL Editor** de Supabase (cambia el correo):
   ```sql
   update auth.users
   set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'
   where email = 'tu-correo@ejemplo.com';
   ```
3. Cierra sesión y vuelve a ingresar.
4. Entra a **Mi perfil → Seguridad de la cuenta** y activa la verificación en
   dos pasos con Google Authenticator o Microsoft Authenticator.
5. Ya puedes abrir `/administracion`. Sin el código de la app, la base de datos
   rechaza cualquier cambio aunque alguien tenga tu contraseña.

## 6. GitHub

En **github.com → tu foto → Settings → Password and authentication**: activa la
verificación en dos pasos de tu cuenta de GitHub (lo más importante).

En el repositorio, **Settings**:
- **Code security**: activa *Dependabot alerts*, *Dependabot security updates*,
  *Secret scanning* con *Push protection* y *Private vulnerability reporting*.
- **Rules → Rulesets → New branch ruleset** para `main`: *Restrict deletions*,
  *Block force pushes*, *Require a pull request before merging* y *Require
  status checks to pass* con `checks` y `secrets`.
- **Actions → General → Workflow permissions**: *Read repository contents*.

Además, en cada PR el CI corre `npm audit` y busca claves en todo el historial
(gitleaks), y CodeQL analiza el código cada semana mientras el repositorio sea
público.

## Qué ya protege el código

- Contraseñas fuertes, correo confirmado obligatorio, sin revelar si un correo ya existe.
- Campo trampa y tiempo mínimo contra robots en registro y recuperación.
- Sesión verificada con el servidor (`getUser` / `getClaims`), cookies `Secure` y `SameSite=Lax`.
- Redirecciones solo a páginas internas conocidas (sin redirecciones abiertas).
- Panel de administración: rol `admin` + verificación en dos pasos, en la web y en la base de datos (RLS).
- Cabeceras: CSP, HSTS, anti-iframe (`frame-ancestors 'none'`), `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- Historial de git revisado: no hay claves ni contraseñas publicadas.
