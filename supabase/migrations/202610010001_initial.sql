begin;

create table public.categories (
  slug text primary key check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 100),
  description text not null,
  icon text not null,
  position integer not null default 0
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null check (slug ~ '^[a-z0-9-]+$'),
  name text not null check (char_length(name) between 2 and 200),
  brand text not null,
  category_slug text not null references public.categories(slug),
  description text not null,
  presentation text not null,
  requires_prescription boolean not null default false,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  search_document tsvector generated always as (
    to_tsvector('spanish', name || ' ' || brand || ' ' || description || ' ' || presentation || ' ' || category_slug || ' ' ||
      case category_slug
        when 'vitaminas' then 'vitaminas suplementos'
        when 'dermocosmetica' then 'dermocosmética piel'
        when 'cuidado-personal' then 'cuidado personal'
        when 'bebe' then 'bebé maternidad'
        when 'primeros-auxilios' then 'primeros auxilios'
        else 'medicamentos'
      end)
  ) stored
);
create index products_search_idx on public.products using gin(search_document);
create index products_category_idx on public.products(category_slug) where published;

create table public.sponsored_ads (
  id uuid primary key default gen_random_uuid(),
  sponsor text not null check (char_length(sponsor) between 2 and 120),
  product text not null check (char_length(product) between 2 and 120),
  headline text not null check (char_length(headline) between 2 and 200),
  description text not null check (char_length(description) between 2 and 1000),
  active boolean not null default false,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  check (ends_at > starts_at)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.sponsored_ads enable row level security;
alter table public.profiles enable row level security;

-- Negar escrituras desde la API pública incluso si cambia una política de lectura.
revoke all on public.categories, public.products, public.sponsored_ads, public.profiles from anon, authenticated;
grant select on public.categories, public.products, public.sponsored_ads to anon, authenticated;
grant select on public.profiles to authenticated;

create policy categories_public_read on public.categories for select to anon, authenticated using (true);
create policy products_public_read on public.products for select to anon, authenticated using (published);
create policy ads_public_read on public.sponsored_ads for select to anon, authenticated
  using (active and starts_at <= now() and ends_at > now());
create policy profile_owner_read on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create function public.create_customer_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;
revoke all on function public.create_customer_profile() from public, anon, authenticated;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.create_customer_profile();

-- Incluir también cuentas existentes cuando se aplique la migración.
insert into public.profiles(id) select id from auth.users on conflict (id) do nothing;

insert into public.categories(slug, name, description, icon, position) values
  ('medicamentos', 'Medicamentos', 'Información para tu tratamiento', 'pill', 1),
  ('vitaminas', 'Vitaminas y suplementos', 'Complementos para tu bienestar', 'leaf', 2),
  ('dermocosmetica', 'Dermocosmética', 'Cuidado especializado de la piel', 'sun', 3),
  ('cuidado-personal', 'Cuidado personal', 'Bienestar en tu día a día', 'sparkles', 4),
  ('bebe', 'Bebé y maternidad', 'Cuidado para los más pequeños', 'baby', 5),
  ('primeros-auxilios', 'Primeros auxilios', 'Esenciales para cuidarte', 'kit', 6);

-- No insertar productos, publicidad ni afirmaciones clínicas de ejemplo en producción.
commit;
