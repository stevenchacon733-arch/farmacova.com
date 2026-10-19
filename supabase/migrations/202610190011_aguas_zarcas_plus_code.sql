-- Farmacova Aguas Zarcas: código Plus exacto (9MG6+57) facilitado por el propietario.
begin;

update public.branches
set address = '9MG6+57, Aguas Zarcas (dentro del Supermercado Economás), San Carlos, Alajuela.', latitude = 10.375438, longitude = -84.339312
where id = 'fc000000-0000-4000-8000-000000000001'
  and latitude = 10.358323 and longitude = -84.323266;

commit;
