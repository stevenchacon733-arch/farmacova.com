-- El propietario confirmó que Farmacova Aguas Zarcas está dentro del Supermercado Economás:
-- dirección y pin tomados del lugar de su enlace de Google Maps.
begin;

update public.branches
set address = 'Dentro del Supermercado Economás, 50 metros norte del Banco Nacional. Aguas Zarcas, San Carlos, Alajuela.'
where id = 'fc000000-0000-4000-8000-000000000001'
  and address = '50 metros norte del Banco Nacional, dentro del supermercado Gran Economás. Aguas Zarcas, San Carlos, Alajuela.';

update public.branches
set latitude = 10.358323, longitude = -84.323266
where id = 'fc000000-0000-4000-8000-000000000001'
  and latitude = 10.3758 and longitude = -84.3412;

-- Farmacia San Carlos: código Plus exacto facilitado por el propietario.
update public.branches
set address = '8HF9+VPH, Ciudad Quesada, Alajuela.', latitude = 10.324688, longitude = -84.430641
where id = 'fc000000-0000-4000-8000-000000000003'
  and address = '8HF9+RPX, Ciudad Quesada, Alajuela.';

commit;
