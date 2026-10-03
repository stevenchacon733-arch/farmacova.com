-- Reemplazo del anuncio emergente solicitado por el propietario.
begin;

update public.sponsored_ads
set active = false
where image_path = '/images/tioflex-raven.png'
   or (product = 'Tioflex' and sponsor = 'Laboratorios Raven');

insert into public.sponsored_ads
  (id, sponsor, product, headline, description, image_path, active, starts_at, ends_at)
values (
  'fc000000-0000-4000-8000-000000000201',
  'Fast&Up', 'Fast&Up Vitamina C + D3 + Zinc',
  'Tabletas efervescentes sabor naranja',
  'Campaña de Fast&Up. Consulta condiciones y disponibilidad en sucursal.',
  '/images/fast-up-vitamina-c-d3-zinc.jpeg', true, now(), now() + interval '1 year'
)
on conflict (id) do nothing;

-- Conservar la primera campaña de Tioflex y desactivar posibles duplicados.
with repeated as (
  select id, row_number() over (order by position, starts_at, id) as ordinal
  from public.hero_campaigns
  where image_path = '/images/tioflex-raven.png' and active
    and starts_at <= now() and ends_at > now()
)
update public.hero_campaigns
set active = false
where id in (select id from repeated where ordinal > 1);

commit;
