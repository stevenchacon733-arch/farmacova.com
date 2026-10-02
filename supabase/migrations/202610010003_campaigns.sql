begin;

create function public.is_farmacova_admin() returns boolean language sql stable
set search_path = '' as $$
  select coalesce((select auth.jwt()) -> 'app_metadata' ->> 'role', '') = 'admin';
$$;
revoke all on function public.is_farmacova_admin() from public, anon;
grant execute on function public.is_farmacova_admin() to authenticated;

create table public.hero_campaigns (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 120),
  eyebrow text not null default '' check (char_length(eyebrow) <= 100),
  description text not null default '' check (char_length(description) <= 500),
  image_path text,
  cta_label text not null check (char_length(cta_label) between 1 and 60),
  cta_href text not null check (cta_href ~ '^/(catalogo|promociones|servicios|sucursales)(/|\?|$)' and cta_href !~ '[[:space:]\\]'),
  sponsored boolean not null default false,
  sponsor text not null default '' check (char_length(sponsor) <= 120),
  position integer not null default 1 check (position between 1 and 999),
  active boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null default (now() + interval '1 year'),
  check (ends_at > starts_at),
  check (not sponsored or char_length(trim(sponsor)) > 0)
);
alter table public.hero_campaigns enable row level security;
revoke all on public.hero_campaigns from anon, authenticated;
grant select on public.hero_campaigns to anon;
grant select, insert, update on public.hero_campaigns to authenticated;

create policy campaigns_public_read on public.hero_campaigns for select to anon, authenticated
  using (active and starts_at <= now() and ends_at > now());
create policy campaigns_admin_read on public.hero_campaigns for select to authenticated
  using ((select public.is_farmacova_admin()));
create policy campaigns_admin_insert on public.hero_campaigns for insert to authenticated
  with check ((select public.is_farmacova_admin()));
create policy campaigns_admin_update on public.hero_campaigns for update to authenticated
  using ((select public.is_farmacova_admin())) with check ((select public.is_farmacova_admin()));

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('campaign-images', 'campaign-images', true, 5242880, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
create policy campaign_images_admin_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'campaign-images' and (select public.is_farmacova_admin()) and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Campaña inicial autorizada por el usuario, usando el archivo entregado.
insert into public.hero_campaigns(title, eyebrow, description, image_path, cta_label, cta_href, sponsored, sponsor, position, active, starts_at, ends_at)
values ('Vuelve a tu ritmo. Sigue adelante.', 'Tioflex · Laboratorios Raven',
  'Conoce la campaña de Tioflex y confirma su disponibilidad en sucursal.',
  '/images/tioflex-raven.png', 'Ver promociones', '/promociones', true,
  'Laboratorios Raven', 1, true, now(), now() + interval '1 year');

commit;
