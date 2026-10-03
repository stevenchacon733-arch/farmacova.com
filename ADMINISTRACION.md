# Panel Farmacova y programa de seis sellos

## Activación

1. Aplicar las cinco migraciones, en orden, de `supabase/migrations/`. Si ya aplicaste las primeras cuatro, ejecutar únicamente `202610030005_branches_monthly_promotions.sql`, que carga las cinco ubicaciones y la selección de octubre y permite editar un segundo teléfono y enlaces de mapas/redes.
2. Configurar Supabase en Vercel y poner `FARMACOVA_DEMO_MODE=false`. El modo demo abre el panel sin credenciales únicamente para revisar su aspecto y simular operaciones; no ejecuta escrituras reales.
3. Crear y confirmar por correo la cuenta del administrador. Asignar `app_metadata.role = admin` desde una operación de administración de Supabase; nunca conceder permisos con `user_metadata`. Cerrar sesión y volver a ingresar. El usuario ve **Administrar farmacia** en `/cuenta`.
4. Revisar el aviso de privacidad, condiciones, productos, precios e información real de las sucursales antes de abrir al público.

## Secciones

- `/administracion`: resumen de registros y estado de configuración de Wallet.
- `/administracion/productos`: alta y edición de medicamentos, categoría, presentación, receta, precio regular y de oferta, fechas de vigencia en Costa Rica, disponibilidad, imagen, más vendidos, destacados y publicación. No hay carrito ni cobros. Los medicamentos de la demo no tienen precios inventados.
- `/administracion/anuncios`: campañas del carrusel, patrocinios, imágenes, enlaces, orden y vigencia.
- `/administracion/clientes`: clientes inscritos, búsqueda por nombre o código QR, registro de compras, canje único de cupones, movimientos recientes y suspensión/reactivación de tarjetas.
- `/administracion/sucursales`: añadir ubicaciones y editar dirección, dos teléfonos independientes, horario, Google Maps, Waze, Facebook y publicación. Servicios disponibles: venta de medicamentos, vacunas e inyectables.
- `/administracion/configuracion`: pausar inscripción/acumulación, acumulación de compras pequeñas, sellos sobre el importe neto al canjear y condiciones adicionales.
- `/administracion/historial`: últimas 100 operaciones del servidor con usuario, entidad, fecha y campos modificados.

## Publicar las promociones del mes

La web pública es informativa: la portada muestra las promociones vigentes justo después del carrusel. Ya no tiene una sección general de medicamentos ni bloques de más vendidos y destacados. Las fichas individuales siguen disponibles para explicar cada producto, sin carrito ni cobros.

En **Productos**, selecciona los productos del mes, activa **Mostrar en promociones** y **Publicado**, carga la imagen y completa la etiqueta, precio y fechas de vigencia. Las fechas se interpretan en horario de Costa Rica. El inicio está incluido y el fin está excluido: para un mes completo, usa el día 1 a las 00:00 y el día 1 del mes siguiente a las 00:00. Una promoción sin fechas sigue visible hasta desactivarla. Los precios de oferta necesitan las dos fechas y un precio menor al regular; el ahorro porcentual de las tarjetas se calcula con esos precios.

La búsqueda pública muestra únicamente promociones vigentes. Las promociones futuras o vencidas no aparecen en las listas; se pueden preparar por adelantado desde el panel. Los anuncios del carrusel se administran por separado en **Anuncios**. Los enlaces antiguos al catálogo general llevan a las promociones.

## Reglas de fidelidad

**Seis espacios; ₡10.000 por sello; 15% al completar; una compra por cupón.**

Por defecto las compras pequeñas se acumulan. ₡5.000 + ₡5.000 genera un sello; ₡60.000 genera seis y un cupón. Los sellos excedentes comienzan el siguiente ciclo; ₡120.000 genera dos cupones. No se pierden fracciones de céntimos porque el servidor trabaja con importes enteros en céntimos.

El beneficio se usa en una factura posterior; la factura que completó los sellos no se puede usar para canjear. Un cupón por factura. No hay vencimiento automático ni un máximo de descuento configurado en esta fase. Las compras de canje acumulan sobre el importe neto pagado por defecto; esta opción puede deshabilitarse. Si se pausa el programa se pueden canjear los cupones existentes, sin generar nuevos sellos.

Ejemplo: tarjeta completa; compra nueva de ₡20.000; descuento ₡3.000; pago ₡17.000. Con acumulación al canjear activa, se añade un sello y quedan ₡7.000 hacia el siguiente.

La tarjeta y los sellos en la web se consultan al cargar `/fidelidad`. Wallet es una copia firmada del estado al descargar: [activación y límites](APPLE-WALLET.md).

## Operación en caja

1. Buscar al cliente por nombre o pegar el código `FC-…` leído del QR. El QR identifica la tarjeta; no autoriza un canje por sí mismo.
2. Introducir una referencia única de factura, incluyendo la sucursal si distintas sucursales comparten numeración.
3. Registrar el importe realmente pagado. La web no registra ni procesa el pago; refleja compras hechas en la farmacia.
4. Para aplicar el 15%, elegir el cupón e ingresar la factura nueva y el importe antes del descuento. Confirmar y aplicar el descuento en el sistema de caja existente.
5. Si la conexión falla, reintentar con los mismos datos. La clave de operación y la factura evitan duplicaciones.

Las compras y los canjes son registros inmutables para usuarios de la aplicación. Esta fase no integra devoluciones, corrección de facturas ni sincronización con un sistema de caja. Una corrección excepcional requiere revisión del responsable en la base de datos, preservando un registro de la operación; no repetir una factura con otro número para ocultar un error.

## Protección de datos y permisos

- Cada cliente lee únicamente su membresía, compras y cupones; no puede cambiar sellos, importes, estado ni concederse cupones.
- Las operaciones de compras y canjes son funciones de PostgreSQL que exigen una cuenta administradora confirmada. Bloquean la tarjeta y la factura durante la transacción, y canjean una sola vez.
- Las políticas RLS protegen catálogo, campañas, sucursales y programa. Los registros publicados se pueden leer sin cuenta; los datos de fidelidad no son públicos.
- Imágenes de producto: PNG/JPEG/WebP de hasta 5 MB, carga exclusiva de administradores al bucket público `product-images`. No subir recetas ni imágenes personales a los buckets públicos.
- El registro de auditoría no duplica nombres, facturas, contraseñas ni datos clínicos. No se almacena el detalle de medicamentos comprados.
- La web no necesita la clave `service_role` para estas operaciones. Certificados y claves de Wallet se mantienen en variables privadas del servidor.

## Verificación

`npm test` ejecuta cálculos de sellos y importes, validaciones, las cuatro migraciones en PostgreSQL embebido, RLS de cliente/administrador/anónimo, idempotencia, factura única y canje único. También comprueba manifiesto y firma CMS con un certificado temporal de prueba. Ejecutar además `npm run lint`, `npm run typecheck` y `npm run build`.

Pendiente en el entorno del propietario: aplicar las migraciones en Supabase real, probar dos sesiones de caja simultáneas, confirmar la política de contraseñas/correo y emitir el pase real en iPhone. Los stubs de auth/storage de la prueba local no verifican la configuración de un proyecto Supabase remoto.
