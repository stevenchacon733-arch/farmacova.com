# Promociones y sucursales de Farmacova

Cambios basados en el documento proporcionado por el propietario y sus indicaciones posteriores del 3 de octubre de 2026.

## Activación en Supabase

Aplicar `supabase/migrations/202610030005_branches_monthly_promotions.sql` después de las cuatro migraciones anteriores. La migración añade campos de sucursales e inserta cinco ubicaciones, tres productos y tres anuncios del carrusel. No sobrescribe registros que ya tienen esos identificadores o enlaces.

Las ubicaciones son Farmacova Aguas Zarcas, Farmacia San Gabriel en Aguas Zarcas, Farmacia San Carlos en Ciudad Quesada, Farmacova Venecia y Farmacova Pital. Aguas Zarcas y Pital abren de 9 a. m. a 9 p. m.; San Carlos, Venecia y San Gabriel, de 8 a. m. a 8 p. m. No se afirmaron días de apertura porque no se proporcionaron. Los números con dos teléfonos se conservan por separado.

El teléfono central es 4000-6769. Instagram y Facebook generales apuntan a los enlaces suministrados. Google Maps y Waze de Aguas Zarcas conservan los enlaces del documento; las demás ubicaciones abren una búsqueda del nombre y dirección/Plus Code suministrados en Google Maps, sin coordenadas inventadas.

En `/administracion/sucursales` puedes añadir más ubicaciones, modificar horarios y enlaces o despublicar una ubicación. En demo esos cambios se guardan solo en el navegador del panel; en producción se guardan en Supabase y aparecen en la web pública. No hay un número fijo de sucursales en la página.

## Selección del mes

Proteína de arveja + BCAA, Enerpax y Fexofén se cargan como la selección de octubre de 2026. Vigencia: 1 de octubre a las 00:00 hasta el 1 de noviembre a las 00:00, en horario de Costa Rica. Cambia las fechas desde **Productos** y **Anuncios** para las próximas campañas. No se inventaron precios, porcentajes de descuento, existencias ni requisitos de receta. Los anuncios nuevos no se etiquetan como patrocinio pagado.

Las fichas individuales conservan «Ver detalles» y la confirmación de disponibilidad en sucursal. El anuncio inicial de Tioflex permanece disponible.

## Imágenes y marca

Se utilizó la herramienta integrada de imágenes para editar los tres anuncios del documento. Instrucción común: quitar únicamente el emblema y texto de Farmacia San Gabriel del encabezado e insertar el logo oficial de Farmacova, preservando el diseño y el contenido de cada campaña. Se revisaron visualmente los resultados. La herramienta vuelve a generar una imagen; no es una sustitución idéntica de píxeles.

Para el logo del sitio, la instrucción fue eliminar el fondo blanco y conservar símbolo, palabra Farmacova y eslogan sobre transparencia. La imagen tiene canal alfa y el encabezado ya no utiliza un recuadro blanco.

Los PNG completos están en la carpeta `outputs/anuncios` de la entrega local. El proyecto incluye versiones WebP de los anuncios en `public/images/` y el logo transparente en `public/images/farmacova-logo-transparente.png`. Los anuncios originales del Word se conservan como referencias de trabajo.
