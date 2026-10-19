-- El propietario confirmó que Farmacova Aguas Zarcas está dentro del Supermercado Economás.
begin;

update public.branches
set address = 'Dentro del Supermercado Economás, 50 metros norte del Banco Nacional. Aguas Zarcas, San Carlos, Alajuela.'
where id = 'fc000000-0000-4000-8000-000000000001'
  and address = '50 metros norte del Banco Nacional, dentro del supermercado Gran Economás. Aguas Zarcas, San Carlos, Alajuela.';

commit;
