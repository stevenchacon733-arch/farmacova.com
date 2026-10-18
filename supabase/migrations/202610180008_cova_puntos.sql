-- Cova Puntos: 1 punto por cada ₡1.000 y un cupón de 15% al completar 60 puntos.
-- Equivale a la tarjeta de sellos anterior (₡10.000 por sello, 6 sellos), así que
-- los saldos se convierten sin pérdida: 1 sello = 10 puntos.
-- Las columnas conservan su nombre (total_stamps, stamps_added) para no romper la API.
begin;
alter table public.loyalty_members drop constraint loyalty_members_remainder_cents_check;
update public.loyalty_members set total_stamps = total_stamps*10 + remainder_cents/100000, remainder_cents = remainder_cents%100000;
alter table public.loyalty_members add constraint loyalty_members_remainder_cents_check check(remainder_cents between 0 and 99999);
update public.loyalty_purchases set stamps_added = stamps_added*10;

create or replace function public.enroll_loyalty(p_name text, p_version integer, p_accepted boolean) returns uuid language plpgsql security definer set search_path='' as $$
declare v_settings public.store_settings; v_id uuid;
begin
 if auth.uid() is null or not exists(select 1 from auth.users where id=auth.uid() and email_confirmed_at is not null) then raise exception 'ACCOUNT_UNVERIFIED'; end if;
 select * into v_settings from public.store_settings where id=1 for share;
 if not v_settings.loyalty_enabled then raise exception 'PROGRAM_PAUSED'; end if;
 if p_accepted is distinct from true or p_version is distinct from v_settings.program_version then raise exception 'TERMS_CHANGED'; end if;
 insert into public.loyalty_members(user_id,display_name,terms_version,terms_snapshot)
 values(auth.uid(),trim(p_name),p_version,'Cova Puntos: 1 punto por cada ₡1.000; 60 puntos = 15% en una compra posterior. Acumular remanente: ' || v_settings.accumulate_remainder::text || '. Puntos sobre importe pagado al canjear: ' || v_settings.earn_on_redemption::text || '. ' || v_settings.loyalty_terms)
 on conflict(user_id) do nothing returning id into v_id;
 if v_id is null then select id into v_id from public.loyalty_members where user_id=auth.uid(); end if;
 return v_id;
end; $$;

create or replace function public.credit_loyalty_purchase(p_member uuid,p_amount bigint,p_receipt text,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
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
 v_added := v_amount/100000; v_total := m.total_stamps+v_added;
 insert into public.loyalty_purchases(id,member_id,receipt,amount_cents,stamps_added,recorded_by) values(p_request,p_member,v_receipt,p_amount,v_added,auth.uid());
 update public.loyalty_members set total_stamps=v_total, remainder_cents=case when s.accumulate_remainder then v_amount%100000 else 0 end where id=p_member;
 for v_cycle in (m.total_stamps/60+1)..(v_total/60) loop
   insert into public.loyalty_rewards(member_id,cycle) values(p_member,v_cycle);
 end loop;
 return jsonb_build_object('stamps',v_added,'rewards',v_total/60-m.total_stamps/60);
end; $$;

create or replace function public.redeem_loyalty_reward(p_reward uuid,p_receipt text,p_amount bigint,p_request uuid) returns jsonb language plpgsql security definer set search_path='' as $$
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
   v_added := v_amount/100000; v_total := m.total_stamps+v_added;
   insert into public.loyalty_purchases(id,member_id,receipt,amount_cents,stamps_added,recorded_by) values(p_request,m.id,v_receipt,p_amount-v_discount,v_added,auth.uid());
   update public.loyalty_members set total_stamps=v_total,remainder_cents=case when s.accumulate_remainder then v_amount%100000 else 0 end where id=m.id;
   for v_cycle in (m.total_stamps/60+1)..(v_total/60) loop insert into public.loyalty_rewards(member_id,cycle) values(m.id,v_cycle); end loop;
 end if;
 return jsonb_build_object('discount_cents',v_discount);
end; $$;
commit;
