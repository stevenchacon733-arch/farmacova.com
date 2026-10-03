begin;
alter table public.hero_campaigns drop constraint hero_campaigns_cta_href_check;
alter table public.hero_campaigns add constraint hero_campaigns_cta_href_check check (cta_href ~ '^/(catalogo|promociones|servicios|sucursales|fidelidad)(/|\?|$)' and cta_href !~ '[[:space:]\\]');

alter table public.products add column price_crc numeric(12,2) check (price_crc between 0.01 and 1000000),
  add column sale_price_crc numeric(12,2) check (sale_price_crc between 0.01 and 1000000),
  add column promotion_starts_at timestamptz,
  add column promotion_ends_at timestamptz,
  add column availability text not null default 'confirmar' check (availability in ('confirmar','disponible','agotado')),
  add constraint product_sale_valid check (sale_price_crc is null or (price_crc is not null and sale_price_crc < price_crc and promotion_starts_at is not null and promotion_ends_at is not null and promotion_ends_at > promotion_starts_at));
grant insert, update on public.products to authenticated;
create policy products_admin_read on public.products for select to authenticated using ((select public.is_farmacova_admin()));
create policy products_admin_insert on public.products for insert to authenticated with check ((select public.is_farmacova_admin()));
create policy products_admin_update on public.products for update to authenticated using ((select public.is_farmacova_admin())) with check ((select public.is_farmacova_admin()));

create table public.branches (
 id uuid primary key default gen_random_uuid(), name text not null check (length(name) between 2 and 120),
 address text not null check (length(address) between 2 and 500), phone text not null default '' check (phone ~ '^\+?[0-9 ()-]{0,24}$'),
 hours text not null default '' check (length(hours) <= 500), published boolean not null default false
);
create table public.store_settings (
 id integer primary key default 1 check (id=1), loyalty_enabled boolean not null default true,
 accumulate_remainder boolean not null default true, earn_on_redemption boolean not null default true, loyalty_terms text not null default '' check (length(loyalty_terms) <= 3000),
 program_version integer not null default 1 check (program_version > 0)
);
insert into public.store_settings(id) values(1);
create function public.version_loyalty_terms() returns trigger language plpgsql set search_path='' as $$
begin
 if new.loyalty_terms is distinct from old.loyalty_terms or new.accumulate_remainder is distinct from old.accumulate_remainder or new.earn_on_redemption is distinct from old.earn_on_redemption then new.program_version := old.program_version+1; else new.program_version := old.program_version; end if;
 return new;
end; $$;
create trigger version_terms before update on public.store_settings for each row execute function public.version_loyalty_terms();
alter table public.branches enable row level security;
alter table public.store_settings enable row level security;
revoke all on public.branches, public.store_settings from anon, authenticated;
grant select on public.branches, public.store_settings to anon, authenticated;
grant insert, update on public.branches to authenticated;
grant update on public.store_settings to authenticated;
create policy branches_public on public.branches for select to anon, authenticated using(published);
create policy branches_admin_read on public.branches for select to authenticated using((select public.is_farmacova_admin()));
create policy branches_admin_insert on public.branches for insert to authenticated with check((select public.is_farmacova_admin()));
create policy branches_admin_update on public.branches for update to authenticated using((select public.is_farmacova_admin())) with check((select public.is_farmacova_admin()));
create policy settings_read on public.store_settings for select to anon, authenticated using(true);
create policy settings_admin on public.store_settings for update to authenticated using((select public.is_farmacova_admin())) with check((select public.is_farmacova_admin()));

create table public.loyalty_members (
 id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
 member_number text not null unique default ('FC-' || upper(replace(gen_random_uuid()::text, '-', ''))),
 display_name text not null check(length(trim(display_name)) between 2 and 100),
 total_stamps bigint not null default 0 check(total_stamps >= 0), remainder_cents bigint not null default 0 check(remainder_cents between 0 and 999999),
 active boolean not null default true, terms_version integer not null, terms_snapshot text not null,
 accepted_at timestamptz not null default now(), created_at timestamptz not null default now()
);
-- La factura se usa una sola vez, incluso si se reintenta con otra clave de operación.
create table public.loyalty_purchases (
 id uuid primary key, member_id uuid not null references public.loyalty_members(id),
 receipt text not null unique check (length(trim(receipt)) between 1 and 100), amount_cents bigint not null check(amount_cents between 1 and 100000000),
 stamps_added integer not null check(stamps_added >= 0), recorded_by uuid not null references auth.users(id), created_at timestamptz not null default now()
);
create table public.loyalty_rewards (
 id uuid primary key default gen_random_uuid(), member_id uuid not null references public.loyalty_members(id), cycle bigint not null,
 discount_percent integer not null default 15 check(discount_percent=15), created_at timestamptz not null default now(),
 redeemed_at timestamptz, redeemed_by uuid references auth.users(id), redemption_receipt text unique,
 redemption_amount_cents bigint, discount_cents bigint, redemption_request uuid unique,
 unique(member_id,cycle),
 check ((redeemed_at is null and redeemed_by is null and redemption_receipt is null and redemption_request is null and redemption_amount_cents is null and discount_cents is null)
 or (redeemed_at is not null and redeemed_by is not null and length(trim(redemption_receipt)) between 1 and 100 and redemption_request is not null and redemption_amount_cents between 1 and 100000000 and discount_cents > 0))
);
create table public.admin_audit (
 id bigint generated always as identity primary key, actor uuid references auth.users(id), entity text not null, entity_id text not null,
 operation text not null, changed_fields text[] not null default '{}', created_at timestamptz not null default now()
);
create index loyalty_purchases_member_date on public.loyalty_purchases(member_id,created_at desc);
create index loyalty_rewards_member on public.loyalty_rewards(member_id);
create index audit_created on public.admin_audit(created_at desc);
alter table public.loyalty_members enable row level security;
alter table public.loyalty_purchases enable row level security;
alter table public.loyalty_rewards enable row level security;
alter table public.admin_audit enable row level security;
revoke all on public.loyalty_members, public.loyalty_purchases, public.loyalty_rewards, public.admin_audit from anon,authenticated;
grant select on public.loyalty_members, public.loyalty_purchases, public.loyalty_rewards, public.admin_audit to authenticated;
grant update(active) on public.loyalty_members to authenticated;
create policy members_read on public.loyalty_members for select to authenticated using(user_id=(select auth.uid()) or (select public.is_farmacova_admin()));
create policy members_admin_status on public.loyalty_members for update to authenticated using((select public.is_farmacova_admin())) with check((select public.is_farmacova_admin()));
create policy purchases_read on public.loyalty_purchases for select to authenticated using ((select public.is_farmacova_admin()) or exists(select 1 from public.loyalty_members m where m.id=member_id and m.user_id=(select auth.uid())));
create policy rewards_read on public.loyalty_rewards for select to authenticated using ((select public.is_farmacova_admin()) or exists(select 1 from public.loyalty_members m where m.id=member_id and m.user_id=(select auth.uid())));
create policy audit_admin on public.admin_audit for select to authenticated using((select public.is_farmacova_admin()));

create function public.enroll_loyalty(p_name text, p_version integer, p_accepted boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare v_settings public.store_settings; v_id uuid;
begin
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'ACCOUNT_UNVERIFIED'; end if;
 select * into v_settings from public.store_settings where id=1 for share;
 if not v_settings.loyalty_enabled then raise exception 'PROGRAM_PAUSED'; end if;
 if p_accepted is distinct from true or p_version is distinct from v_settings.program_version then raise exception 'TERMS_CHANGED'; end if;
 insert into public.loyalty_members(user_id,display_name,terms_version,terms_snapshot)
 values(auth.uid(),trim(p_name),p_version,'6 sellos de ₡10.000 = 15% en una compra posterior. Acumular remanente: ' || v_settings.accumulate_remainder::text || '. Sellos sobre importe pagado al canjear: ' || v_settings.earn_on_redemption::text || '. ' || v_settings.loyalty_terms)
 on conflict(user_id) do nothing returning id into v_id;
 if v_id is null then select id into v_id from public.loyalty_members where user_id=auth.uid(); end if;
 return v_id;
end; $$;

create function public.credit_loyalty_purchase(p_member uuid,p_amount bigint,p_receipt text,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare m public.loyalty_members; s public.store_settings; previous public.loyalty_purchases;
 v_added integer; v_amount bigint; v_total bigint; v_cycle bigint; v_receipt text := upper(trim(p_receipt));
begin
 if not public.is_farmacova_admin() or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'ADMIN_REQUIRED'; end if;
 select * into s from public.store_settings where id=1 for share;
 if not s.loyalty_enabled then raise exception 'PROGRAM_PAUSED'; end if;
 if p_amount is null or p_amount not between 1 and 100000000 or p_request is null or v_receipt is null or length(v_receipt) not between 1 and 100 then raise exception 'INVALID_PURCHASE'; end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_receipt,0));
 select * into m from public.loyalty_members where id=p_member for update;
 if m.id is null or not m.active then raise exception 'MEMBER_INACTIVE'; end if;
 select * into previous from public.loyalty_purchases where id=p_request;
 if previous.id is not null then
   if previous.member_id <> p_member or previous.amount_cents <> p_amount or previous.receipt <> v_receipt then raise exception 'REQUEST_CONFLICT'; end if;
   return jsonb_build_object('stamps',previous.stamps_added,'duplicate',true);
 end if;
 if exists(select 1 from public.loyalty_rewards where redemption_receipt=v_receipt) then raise exception 'RECEIPT_USED_FOR_REDEMPTION'; end if;
 v_amount := p_amount + case when s.accumulate_remainder then m.remainder_cents else 0 end;
 v_added := v_amount/1000000; v_total := m.total_stamps+v_added;
 insert into public.loyalty_purchases(id,member_id,receipt,amount_cents,stamps_added,recorded_by) values(p_request,p_member,v_receipt,p_amount,v_added,auth.uid());
 update public.loyalty_members set total_stamps=v_total, remainder_cents=case when s.accumulate_remainder then v_amount%1000000 else 0 end where id=p_member;
 for v_cycle in (m.total_stamps/6+1)..(v_total/6) loop
   insert into public.loyalty_rewards(member_id,cycle) values(p_member,v_cycle);
 end loop;
 return jsonb_build_object('stamps',v_added,'rewards',v_total/6-m.total_stamps/6);
end; $$;

create function public.redeem_loyalty_reward(p_reward uuid,p_receipt text,p_amount bigint,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
declare r public.loyalty_rewards; m public.loyalty_members; s public.store_settings; v_receipt text := upper(trim(p_receipt)); v_discount bigint; v_amount bigint; v_added integer; v_total bigint; v_cycle bigint;
begin
 if not public.is_farmacova_admin() or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'ADMIN_REQUIRED'; end if;
 if p_request is null or p_amount is null or p_amount not between 1 and 100000000 or v_receipt is null or length(v_receipt) not between 1 and 100 then raise exception 'INVALID_REDEMPTION'; end if;
 select * into s from public.store_settings where id=1 for share;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_receipt,0));
 -- Todas las operaciones financieras usan el mismo orden de bloqueo.
 select m0.* into m from public.loyalty_members m0 join public.loyalty_rewards r0 on r0.member_id=m0.id where r0.id=p_reward for update of m0;
 if m.id is null or not m.active then raise exception 'MEMBER_INACTIVE'; end if;
 select * into r from public.loyalty_rewards where id=p_reward for update;
 if r.redeemed_at is not null then
   if r.redemption_request=p_request and r.redemption_receipt=v_receipt and r.redemption_amount_cents=p_amount then return jsonb_build_object('discount_cents',r.discount_cents,'duplicate',true); end if;
   raise exception 'REWARD_ALREADY_REDEEMED';
 end if;
 if exists(select 1 from public.loyalty_purchases where receipt=v_receipt) then raise exception 'USE_NEW_PURCHASE'; end if;
 v_discount := round(p_amount::numeric*15/100);
 if v_discount < 1 then raise exception 'INVALID_REDEMPTION'; end if;
 update public.loyalty_rewards set redeemed_at=now(),redeemed_by=auth.uid(),redemption_receipt=v_receipt,redemption_amount_cents=p_amount,discount_cents=v_discount,redemption_request=p_request where id=p_reward;
 if s.loyalty_enabled and s.earn_on_redemption then
   v_amount := p_amount-v_discount + case when s.accumulate_remainder then m.remainder_cents else 0 end;
   v_added := v_amount/1000000; v_total := m.total_stamps+v_added;
   insert into public.loyalty_purchases(id,member_id,receipt,amount_cents,stamps_added,recorded_by) values(p_request,m.id,v_receipt,p_amount-v_discount,v_added,auth.uid());
   update public.loyalty_members set total_stamps=v_total,remainder_cents=case when s.accumulate_remainder then v_amount%1000000 else 0 end where id=m.id;
   for v_cycle in (m.total_stamps/6+1)..(v_total/6) loop insert into public.loyalty_rewards(member_id,cycle) values(m.id,v_cycle); end loop;
 end if;
 return jsonb_build_object('discount_cents',v_discount);
end; $$;
revoke all on function public.enroll_loyalty(text,integer,boolean), public.credit_loyalty_purchase(uuid,bigint,text,uuid), public.redeem_loyalty_reward(uuid,text,bigint,uuid) from public,anon;
grant execute on function public.enroll_loyalty(text,integer,boolean), public.credit_loyalty_purchase(uuid,bigint,text,uuid), public.redeem_loyalty_reward(uuid,text,bigint,uuid) to authenticated;

-- Registro sin copiar nombres, facturas, certificados ni datos clínicos al historial.
create function public.log_admin_change() returns trigger language plpgsql security definer set search_path='' as $$
declare v_changed text[];
begin
 if tg_op='UPDATE' then select array_agg(key) into v_changed from jsonb_each(to_jsonb(new)) where value is distinct from to_jsonb(old)->key; end if;
 insert into public.admin_audit(actor,entity,entity_id,operation,changed_fields) values(auth.uid(),tg_table_name,to_jsonb(new)->>'id',tg_op,coalesce(v_changed,'{}'));
 return new;
end; $$;
revoke all on function public.log_admin_change() from public,anon,authenticated;
create trigger audit_products after insert or update on public.products for each row execute function public.log_admin_change();
create trigger audit_branches after insert or update on public.branches for each row execute function public.log_admin_change();
create trigger audit_settings after update on public.store_settings for each row execute function public.log_admin_change();
create trigger audit_campaigns after insert or update on public.hero_campaigns for each row execute function public.log_admin_change();
create trigger audit_members after insert or update on public.loyalty_members for each row execute function public.log_admin_change();
create trigger audit_purchases after insert on public.loyalty_purchases for each row execute function public.log_admin_change();
create trigger audit_rewards after insert or update on public.loyalty_rewards for each row execute function public.log_admin_change();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('product-images','product-images',true,5242880,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy product_images_admin_upload on storage.objects for insert to authenticated with check(bucket_id='product-images' and (select public.is_farmacova_admin()) and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
