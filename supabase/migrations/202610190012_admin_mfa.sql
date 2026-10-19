begin;

-- El rol de administrador solo vale con la verificación en dos pasos hecha en
-- esta sesión (aal2). Una contraseña robada no basta para tocar precios,
-- puntos ni anuncios: todas las políticas RLS y funciones usan esta función.
create or replace function public.is_farmacova_admin() returns boolean language sql stable
set search_path = '' as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin'
    and coalesce((select auth.jwt()) ->> 'aal', '') = 'aal2';
$$;
revoke all on function public.is_farmacova_admin() from public, anon;
grant execute on function public.is_farmacova_admin() to authenticated;

commit;
