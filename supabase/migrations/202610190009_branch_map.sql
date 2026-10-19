-- Mapa de sucursales: localidad para el filtro y coordenadas del pin.
-- Aplicar después de las migraciones anteriores. Solo completa filas vacías.
begin;

alter table public.branches
  add column city text not null default '' check (length(city) <= 80),
  add column latitude double precision check (latitude between 5 and 12),
  add column longitude double precision check (longitude between -87 and -82);

-- Coordenadas desde el código Plus de cada sucursal; Farmacova Aguas Zarcas
-- es aproximada hasta confirmarla.
update public.branches as b set city = v.city, latitude = v.lat, longitude = v.lng
from (values
  ('fc000000-0000-4000-8000-000000000001'::uuid, 'Aguas Zarcas', 10.3758, -84.3412),
  ('fc000000-0000-4000-8000-000000000002'::uuid, 'Aguas Zarcas', 10.375188, -84.339688),
  ('fc000000-0000-4000-8000-000000000003'::uuid, 'Ciudad Quesada', 10.324563, -84.430688),
  ('fc000000-0000-4000-8000-000000000004'::uuid, 'Venecia', 10.353938, -84.274063),
  ('fc000000-0000-4000-8000-000000000005'::uuid, 'Pital', 10.452063, -84.272063)
) as v(id, city, lat, lng)
where b.id = v.id and b.city = '' and b.latitude is null;

commit;
