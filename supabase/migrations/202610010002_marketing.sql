begin;

insert into public.categories(slug, name, description, icon, position) values
  ('dolor', 'Dolor y fiebre', 'Medicamentos de esta categoría', 'pill', 1),
  ('respiratorio', 'Salud respiratoria', 'Medicamentos de esta categoría', 'wind', 2),
  ('digestivo', 'Salud digestiva', 'Medicamentos de esta categoría', 'heart', 3),
  ('prescripcion', 'Con receta', 'Medicamentos sujetos a prescripción', 'clipboard', 4)
on conflict (slug) do update set name = excluded.name, description = excluded.description,
  icon = excluded.icon, position = excluded.position;

alter table public.products
  add column bestseller_rank integer check (bestseller_rank is null or bestseller_rank > 0),
  add column promotional boolean not null default false,
  add column promotion_label text check (promotion_label is null or char_length(promotion_label) <= 60),
  add column image_path text;
alter table public.products alter column requires_prescription drop not null;
alter table public.products alter column requires_prescription drop default;
alter table public.sponsored_ads add column image_path text;

-- El ranking debe basarse en datos de ventas reales; no se insertan rankings ficticios.
create index products_bestseller_idx on public.products(bestseller_rank)
  where published and bestseller_rank is not null;

alter table public.products drop column search_document;
alter table public.products add column search_document tsvector generated always as (
  to_tsvector('spanish', name || ' ' || brand || ' ' || description || ' ' || presentation || ' ' || category_slug || ' ' ||
    case category_slug
      when 'dolor' then 'dolor fiebre medicamentos'
      when 'respiratorio' then 'salud respiratoria medicamentos'
      when 'digestivo' then 'salud digestiva medicamentos'
      when 'prescripcion' then 'receta prescripción medicamentos'
      else 'medicamentos'
    end)
) stored;
create index products_search_idx on public.products using gin(search_document);

-- Las categorías históricas se conservan para no borrar datos existentes.
-- La aplicación muestra únicamente las cuatro categorías de medicamentos anteriores.
commit;
