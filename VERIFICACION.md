# Verificación de Farmacova · 2 de octubre de 2026

## Comprobado localmente

- Compilación de producción de Next.js, TypeScript y ESLint sin errores.
- 13 pruebas automatizadas: autenticación/validación, enlaces seguros, campañas, cálculo monetario y sellos, las cuatro migraciones, permisos RLS, reintentos, facturas únicas, cupón de canje único y firma CMS del `.pkpass`.
- Las migraciones se ejecutaron en PostgreSQL embebido (PGlite) con sustitutos de auth/storage. Se probó que un cliente no aumenta su saldo, otro cliente no lee su tarjeta y anónimo no lee membresías. Se probó ₡5.000 + ₡5.000, seis sellos, canje de 15%, reintentos y rechazo de un segundo canje.
- La firma del pase se verificó criptográficamente con un certificado temporal de prueba; el manifiesto alterado se rechazó. Incluye certificado firmante, certificado intermedio y atributo de fecha. Ninguna clave de prueba se guarda en el repositorio.
- Navegador: seis clicks de prueba completan seis espacios y muestran un cupón. En el panel, ₡60.000 generan seis sellos; canjear en una compra nueva de ₡20.000 aplica ₡3.000 de descuento, consume el cupón y acumula sobre ₡17.000 según configuración inicial.
- Editor de productos: rechaza una oferta mayor al precio regular; guarda oferta y fechas válidas en horario de Costa Rica; los valores persisten al volver a abrir la ficha. Los precios de prueba se restauraron al terminar.
- Tarjeta en un viewport móvil de 390×844: seis espacios, controles utilizables y sin desbordamiento horizontal. Capturas guardadas fuera del repositorio en la carpeta outputs.
- `npm audit --omit=dev`: cero vulnerabilidades de dependencias de producción. La auditoría completa detecta avisos de desarrollo heredados en braces y sus dependientes de ESLint; no hay versión parcheada de braces disponible al comprobarlo. No se degradó Next.js para ocultar el aviso.

## Requiere configuración del propietario

- Proyecto Supabase real: aplicar la cuarta migración si ya existen las tres primeras, configurar las variables, poner `FARMACOVA_DEMO_MODE=false`, verificar correo/contraseñas y asignar el rol administrativo desde un entorno de confianza.
- Prueba con dos administradores simultáneos en el proyecto remoto; las transacciones usan bloqueos por tarjeta/factura pero no se verificaron contra un Supabase remoto sin credenciales.
- Certificados reales Pass Type ID/WWDR y prueba en un iPhone. La presencia de variables no confirma que Apple acepte el pase.
- Configurar Vercel, dominio HTTPS y redirecciones de Auth. Actualizar GitHub no equivale a confirmar un despliegue exitoso de Vercel.

## Límites explícitos

- Demo: cambios locales del panel y simulaciones; no representa clientes, ventas, precios ni cupones reales.
- Wallet: volver a descargar después de una compra/canje; no se implementó registro de dispositivos ni notificaciones para actualizaciones automáticas.
- Caja: registro manual y canje administrativo; sin cobros, carrito, sincronización de POS ni devoluciones/correcciones automáticas.
- Catálogo y datos de sucursales deben completarse con información oficial; los medicamentos de ejemplo no se publican mediante las migraciones.

Guías: [panel](ADMINISTRACION.md), [Apple Wallet](APPLE-WALLET.md), [proyecto](README.md).
