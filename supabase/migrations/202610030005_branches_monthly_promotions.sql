-- Datos y campañas facilitados por el propietario el 3 de octubre de 2026.
-- Aplicar después de las cuatro migraciones anteriores. No sobrescribe registros existentes.
begin;

alter table public.branches
  add column secondary_phone text not null default '' check (secondary_phone ~ '^\+?[0-9 ()-]{0,24}$'),
  add column maps_url text not null default '' check (length(maps_url) <= 1000 and (maps_url = '' or maps_url ~ '^https://((www\.)?google\.com/|maps\.google\.com/|maps\.app\.goo\.gl/)')),
  add column waze_url text not null default '' check (length(waze_url) <= 1000 and (waze_url = '' or waze_url ~ '^https://(www\.)?waze\.com/')),
  add column facebook_url text not null default '' check (length(facebook_url) <= 1000 and (facebook_url = '' or facebook_url ~ '^https://(www\.)?facebook\.com/'));

insert into public.categories(slug,name,description,icon,position)
values('nutricion','Nutrición y suplementos','Información de productos de nutrición','leaf',5)
on conflict(slug) do nothing;

insert into public.branches(id,name,address,phone,secondary_phone,hours,maps_url,waze_url,facebook_url,published) values
('fc000000-0000-4000-8000-000000000001','Farmacova Aguas Zarcas','50 metros norte del Banco Nacional, dentro del supermercado Gran Economás. Aguas Zarcas, San Carlos, Alajuela.','8375-0404','','9:00 a. m. a 9:00 p. m.','https://www.google.com/maps?um=1&ie=UTF-8&fb=1&gl=cr&sa=X&geocode=KWd-L3sQY6CPMUi2Fx2kRzxO&daddr=50+metros+norte+del+banco+nacional+de+costa+rica,+dentro+del+gran+econ%C3%B3+m%C3%A1s+Alajuela+san+carlos,+21004','https://www.waze.com/es/live-map/directions/cr/provincia-de-alajuela/aguas-zarcas/farmacova?to=place.ChIJZ34vexBjoI8RSLYXHaRHPE4','',true),
('fc000000-0000-4000-8000-000000000002','Farmacia San Gabriel · Aguas Zarcas','9MG6+345, Aguas Zarcas, Alajuela.','2474-2505','6077-5505','8:00 a. m. a 8:00 p. m.','','','https://www.facebook.com/farmaciasangabrielcr',true),
('fc000000-0000-4000-8000-000000000003','Farmacia San Carlos','8HF9+RPX, Ciudad Quesada, Alajuela.','2460-0309','8336-8336','8:00 a. m. a 8:00 p. m.','','','',true),
('fc000000-0000-4000-8000-000000000004','Farmacova Venecia','9P3G+H9, Venecia, Alajuela.','8472-8472','','8:00 a. m. a 8:00 p. m.','','','',true),
('fc000000-0000-4000-8000-000000000005','Farmacova Pital','Dentro del supermercado Economás. FP2H+R5, Pital, Alajuela.','8480-8480','','9:00 a. m. a 9:00 p. m.','','','',true)
on conflict (id) do nothing;

-- Selección de octubre: sin precios, descuentos ni requisitos de receta inventados.
insert into public.products(slug,name,brand,category_slug,description,presentation,requires_prescription,featured,bestseller_rank,promotional,promotion_label,image_path,promotion_starts_at,promotion_ends_at,published) values
('proteina-arveja-bcaa','Proteína de arveja + BCAA','Raven Nutrition Care','nutricion','Conoce la campaña de proteína de arveja + BCAA de Raven Nutrition Care. Consulta las presentaciones, condiciones y disponibilidad en sucursal.','Polvo · presentación por confirmar en sucursal',null,false,null,true,'Selección del mes','/images/proteina-bcaa-farmacova.webp','2026-10-01T06:00:00Z','2026-11-01T06:00:00Z',true),
('enerpax','Enerpax','Raven Nutrition Care','nutricion','Descubre la campaña de Enerpax y sus sabores chocolate, fresa y naranja. Confirma las presentaciones y disponibilidad con tu sucursal Farmacova.','Bebida fortificada en polvo · sabores según el anuncio',null,false,null,true,'Selección del mes','/images/enerpax-farmacova.webp','2026-10-01T06:00:00Z','2026-11-01T06:00:00Z',true),
('fexofen','Fexofén','Laboratorios Raven','respiratorio','Conoce la campaña de la línea Fexofén. Las presentaciones, requisitos de dispensación y disponibilidad se confirman con el equipo farmacéutico en sucursal.','Línea de presentaciones según el anuncio',null,false,null,true,'Selección del mes','/images/fexofen-farmacova.webp','2026-10-01T06:00:00Z','2026-11-01T06:00:00Z',true)
on conflict (slug) do nothing;

-- Los anuncios se gestionan por separado en el panel. No se marca patrocinio pagado.
insert into public.hero_campaigns(id,title,eyebrow,description,image_path,cta_label,cta_href,sponsored,sponsor,position,active,starts_at,ends_at) values
('fc000000-0000-4000-8000-000000000101','Proteína de arveja + BCAA','Farmacova · Selección del mes','Conoce la campaña de proteína de arveja + BCAA de Raven Nutrition Care. Consulta las presentaciones, condiciones y disponibilidad en sucursal.','/images/proteina-bcaa-farmacova.webp','Ver detalles','/catalogo/proteina-arveja-bcaa',false,'',4,true,'2026-10-01T06:00:00Z','2026-11-01T06:00:00Z'),
('fc000000-0000-4000-8000-000000000102','Enerpax','Farmacova · Selección del mes','Descubre la campaña de Enerpax y sus sabores chocolate, fresa y naranja. Confirma las presentaciones y disponibilidad con tu sucursal Farmacova.','/images/enerpax-farmacova.webp','Ver detalles','/catalogo/enerpax',false,'',5,true,'2026-10-01T06:00:00Z','2026-11-01T06:00:00Z'),
('fc000000-0000-4000-8000-000000000103','Fexofén','Farmacova · Selección del mes','Conoce la campaña de la línea Fexofén. Las presentaciones, requisitos de dispensación y disponibilidad se confirman con el equipo farmacéutico en sucursal.','/images/fexofen-farmacova.webp','Ver detalles','/catalogo/fexofen',false,'',6,true,'2026-10-01T06:00:00Z','2026-11-01T06:00:00Z')
on conflict (id) do nothing;

commit;
