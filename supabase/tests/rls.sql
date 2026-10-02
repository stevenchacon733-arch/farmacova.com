-- Verificar en un proyecto de prueba después de aplicar la migración.
-- Cada DO debe terminar sin excepción. La transacción no conserva datos.
begin;

insert into public.products(slug, name, brand, category_slug, description, presentation, published)
values ('test-publico', 'Producto público', 'Prueba', 'vitaminas', 'Prueba', 'Prueba', true),
       ('test-privado', 'Producto privado', 'Prueba', 'vitaminas', 'Prueba', 'Prueba', false);

set local role anon;
do $$ begin
  if (select count(*) from public.products where slug = 'test-publico') <> 1 then
    raise exception 'El producto publicado debe ser visible';
  end if;
  if exists (select 1 from public.products where slug = 'test-privado') then
    raise exception 'El borrador no debe ser visible';
  end if;
  if has_table_privilege(current_user, 'public.profiles', 'select') then
    raise exception 'anon no debe leer perfiles';
  end if;
  if has_table_privilege(current_user, 'public.products', 'insert') then
    raise exception 'anon no debe escribir productos';
  end if;
end $$;
reset role;

set local role authenticated;
do $$ begin
  if exists (select 1 from public.profiles) then
    raise exception 'Un JWT sin identidad no debe leer perfiles';
  end if;
  if has_table_privilege(current_user, 'public.profiles', 'insert') then
    raise exception 'authenticated no debe insertar perfiles arbitrarios';
  end if;
end $$;
rollback;
