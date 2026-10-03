# Farmacova · CUIDAMOS DE TI

Aplicación en español para una farmacia de Costa Rica. Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4 y Supabase. Preparada para GitHub y Vercel.

## Iniciar el proyecto

Requiere Node.js 24 y npm. Abre una terminal en esta carpeta:

```bash
npm ci
```

Copia `.env.example` a `.env.local`. El modo de ejemplo permite revisar el sitio sin credenciales.

```bash
npm run dev
```

Abre http://localhost:3000. Para ejecutar una compilación de producción: `npm run build` y `npm start`.

## Diseño y funciones

- Logo oficial proporcionado por Farmacova, con eslogan CUIDAMOS DE TI.
- Encabezado azul marino, pestaña verde de ofertas, búsqueda amplia y carrusel a todo el ancho, con texto a la izquierda e imagen a la derecha, siguiendo las nuevas referencias.
- Cambio automático cada 6 segundos, flechas, puntos, teclado y deslizamiento táctil. Botón para pausar/reanudar. Se pausa al pasar el cursor, al mantener el foco dentro, con la pestaña oculta y mientras hay un modal abierto. Respeta la preferencia de movimiento reducido.
- Anuncio real de Raven/Tioflex incluido en `public/images/tioflex-raven.png`. Se muestra completo en el carrusel y en el pop-up.
- Pop-up a los 3 segundos: solo la X o Cerrar y continuar permiten quitarlo. El fondo queda bloqueado y Escape no lo cierra.
- Promociones del mes inmediatamente debajo del carrusel: tarjetas grandes deslizables, acceso a todas las ofertas y franjas de color entre apartados. Solo productos publicados y promociones vigentes; búsqueda y paginación en `/promociones`. El catálogo general se retiró de la navegación y sus enlaces antiguos redirigen a promociones. Se conservan las fichas informativas de producto. Sin carrito ni pagos.
- Servicios: venta de medicamentos, aplicación de vacunas y aplicación de inyectables. Se retiró el portal de consultas según lo solicitado.
- Registro, ingreso, confirmación de correo, recuperación y cambio de contraseña mediante Supabase. Perfil protegido.

## Cambiar los anuncios

En la vista previa abre `/administracion/anuncios`, también disponible mediante Editar carrusel en la portada. Permite crear campañas, subir imágenes PNG/JPG/WebP, cambiar textos y botones, ordenar, activar/desactivar, definir vigencia e identificar patrocinadores.

**En modo de ejemplo los cambios se guardan solo en este navegador** mediante localStorage. No se publican para otros visitantes. Imágenes de hasta 2 MB; el límite total depende del navegador. En producción las campañas y las imágenes se guardan en Supabase y el acceso exige una cuenta de administrador.

Para publicar: configurar Supabase, aplicar las cuatro migraciones y asignar `app_metadata.role = admin` a la cuenta elegida mediante una operación administrativa de Supabase. No usar `user_metadata` para conceder permisos. Renovar la sesión después de cambiar el rol. El usuario administrador tendrá un enlace al panel desde `/cuenta`. La clave administrativa nunca debe aparecer en el navegador ni en GitHub.

## Club Farmacova y panel completo

Tarjeta de **seis sellos**, uno por cada **₡10.000**, y cupón de **15% para una compra posterior** al completar la tarjeta. `/fidelidad` muestra la tarjeta y permite inscribirse con correo confirmado. `/administracion` reúne productos, precios, promociones, anuncios, clientes, compras en sucursal, canjes, sucursales, condiciones e historial.

Las compras y los canjes se procesan de forma atómica en PostgreSQL, con facturas únicas y protección frente a reintentos. Por defecto las compras pequeñas se acumulan y los importes netos al canjear generan sellos; estas opciones se pueden configurar. Los cambios del panel en modo demo son locales y no publican datos reales.

[Operación y activación del panel](ADMINISTRACION.md) · [Configurar Apple Wallet y certificados](APPLE-WALLET.md).

Apple Wallet emite un `.pkpass` firmado cuando se configuran los certificados privados. **Su progreso requiere volver a descargar la tarjeta después de comprar; no hay actualizaciones automáticas en Wallet en esta fase.** La tarjeta web consulta el saldo al cargar. Sin certificados, la descarga queda deshabilitada.

## Estructura

```text
src/
  app/
    layout.tsx, page.tsx, globals.css
    catalogo/page.tsx, catalogo/[slug]/page.tsx
    promociones/page.tsx, servicios/page.tsx, sucursales/page.tsx
    administracion/anuncios/page.tsx
    auth/page.tsx, auth/callback/route.ts, auth/confirm/route.ts
    auth/actualizar-clave/page.tsx, cuenta/page.tsx
    privacidad/page.tsx, error.tsx, loading.tsx, not-found.tsx
  components/
    layout/       # Marca, navegación y pie
    marketing/    # Carrusel, editor y servicios
    ads/          # Modal publicitario
    auth/         # Formularios, cuenta y cierre de sesión
    catalog/      # Tarjetas de medicamentos
    ui/           # Iconos de categorías
  lib/
    campaigns.ts, campaigns-server.ts
    catalog.ts, validation.ts
    supabase/     # Cliente, servidor y configuración
  proxy.ts        # Verificación y renovación de sesión
public/images/
supabase/migrations/
supabase/tests/
tests/
.github/workflows/ci.yml
```

## Configurar Supabase

1. Crea el proyecto y aplica, en orden, los archivos `202610010001_initial.sql`, `202610010002_marketing.sql`, `202610010003_campaigns.sql` y `202610020004_management_loyalty.sql` de `supabase/migrations/`. Incluyen catálogo, perfiles, publicidad, campañas, precios, sucursales, fidelidad, almacenamiento de imágenes y RLS. Si las primeras tres ya se aplicaron, ejecuta solamente la cuarta.
2. Copia las variables en `.env.local` y en Vercel:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICABLE
FARMACOVA_DEMO_MODE=false
```

3. Activa Email/Password y Confirm email. Configura contraseña mínima de 8 caracteres con mayúsculas, minúsculas, números y símbolos en Supabase. La misma validación se realiza en el formulario; la política del servidor es necesaria para peticiones directas. `supabase/config.toml` solo configura el entorno Supabase local.
4. Configura Site URL y redirecciones exactas a `/auth/callback` y `/auth/callback?next=/auth/actualizar-clave`, tanto para desarrollo como para el dominio final.
5. Configura SMTP para los correos de registro y recuperación en producción.

Un regex comprueba el formato del correo; su titularidad se confirma con el enlace enviado por Supabase. La página de cuenta verifica la identidad con `getUser()` y exige correo confirmado. El proxy renueva la sesión usando `getClaims()`. Cookies SameSite=Lax y Secure en producción.

### Plantillas de correo

Para confirmar registro en cualquier dispositivo:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a>
```

Para recuperar contraseña:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Cambiar mi contraseña</a>
```

También se incluye el callback PKCE para enlaces predeterminados. No registrar tokens ni contraseñas en logs.

## Catálogo y datos comerciales

La migración no publica medicamentos ficticios. Añade tus fichas reales en `products` y activa `published`. Categorías visibles: dolor, respiratorio, digestivo y prescripcion. Configura `featured`, `bestseller_rank`, `promotional` y `promotion_label` para las secciones comerciales. El orden de más vendidos debe proceder de ventas reales. No se han inventado precios, descuentos ni condiciones de dispensación.

Los ejemplos se identifican como vista previa. La imagen de Tioflex fue proporcionada por el propietario. `sponsored_ads` controla el modal; `hero_campaigns` controla el carrusel. El código usa el anuncio suministrado como contenido inicial del modal. Para campañas reales completa vigencia, estado e imagen.

Las políticas RLS permiten leer productos publicados y campañas vigentes. Solo administradores pueden crear/modificar campañas y subir imágenes. Los perfiles solo son legibles por su propietario. Los datos de contacto, horarios y el aviso de privacidad deben completarse con información oficial antes de publicar cuentas al público.

## Publicar en Vercel

1. Importa `stevenchacon733-arch/farmacova.com` desde Vercel.
2. Framework Next.js; raíz del proyecto `./`; Node.js 24.x. Compilación `npm run build`.
3. Para revisar el diseño sin Supabase, usa `FARMACOVA_DEMO_MODE=true`. Las cuentas quedan deshabilitadas sin las dos variables de Supabase.
4. Para producción configura las variables anteriores, aplica las migraciones y cambia el modo de ejemplo a false.
5. Actualiza el dominio en Auth, completa sucursales/privacidad y publica el catálogo real.

`.env.local`, node_modules y .next están excluidos de Git. Nunca publiques claves secretas ni service_role.

## Verificar

```bash
npm run lint
npm test
npm run build
npm run typecheck
```

GitHub Actions ejecuta estas comprobaciones. Las pruebas cubren correo, contraseñas, redirecciones, campañas, sellos e importes, migraciones y RLS en PostgreSQL embebido, cupones de uso único y la firma CMS del pase con certificados de prueba. `supabase/tests/rls.sql` puede ejecutarse en un proyecto de prueba. No sustituye la verificación del proyecto Supabase real ni del pase en iPhone.

En entornos que impiden crear procesos secundarios se incluye un ajuste opcional: `FARMACOVA_RESTRICTED_BUILD=true` con `next build --webpack`. No es necesario para Vercel.

Sin credenciales reales no se ha verificado el envío de correos, las sesiones ni las migraciones en un servidor Supabase. Consulta VERIFICACION.md para el detalle de las comprobaciones realizadas.
