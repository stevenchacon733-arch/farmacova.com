-- Permite administrar el pop-up de la portada desde el panel.
begin;

grant select, insert, update on public.sponsored_ads to authenticated;

create policy ads_admin_read on public.sponsored_ads for select to authenticated
  using ((select public.is_farmacova_admin()));
create policy ads_admin_insert on public.sponsored_ads for insert to authenticated
  with check ((select public.is_farmacova_admin()));
create policy ads_admin_update on public.sponsored_ads for update to authenticated
  using ((select public.is_farmacova_admin())) with check ((select public.is_farmacova_admin()));

-- Imagen: archivo local del sitio o del bucket público de campañas.
alter table public.sponsored_ads add constraint sponsored_ads_image_path_valid check (
  image_path is null
  or image_path ~ '^/images/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp)$'
  or image_path ~ '^https://[a-z0-9.-]+/storage/v1/object/public/campaign-images/[a-f0-9-]+/[a-f0-9-]+\.(png|jpg|webp)$'
) not valid;

commit;
