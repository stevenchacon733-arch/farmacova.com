import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { PGlite } from "@electric-sql/pglite";

// PostgreSQL embebido ejecuta las migraciones y RLS; auth/storage se sustituyen
// solo en este entorno de prueba. No equivale a probar un proyecto Supabase vivo.
test("migraciones: sellos, canje único, reintentos y permisos reales de PostgreSQL", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated;
 create schema auth; create schema storage;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select (nullif(current_setting('request.jwt.claims',true),'')::jsonb->>'sub')::uuid $$;`);
    await db.exec(`
 create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$;
 grant usage on schema auth to anon,authenticated; grant execute on all functions in schema auth to anon,authenticated;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
 alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql immutable as $$ select string_to_array($1,'/') $$;`);
    const migrations = new URL("../supabase/migrations/", import.meta.url);
    for (const filename of (await readdir(migrations))
      .filter((f) => f.endsWith(".sql"))
      .sort())
      await db.exec(await readFile(new URL(filename, migrations), "utf8"));
    const admin = randomUUID(),
      customer = randomUUID(),
      other = randomUUID();
    for (const id of [admin, customer, other])
      await db.query(
        "insert into auth.users(id,email_confirmed_at) values($1,now())",
        [id],
      );
    async function session(id: string, role = "customer") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claims',$1,false)", [
        JSON.stringify({ sub: id, app_metadata: { role } }),
      ]);
      await db.exec("set role authenticated");
    }
    await session(customer);
    const enrollment = await db.query<{ id: string }>(
      "select public.enroll_loyalty('Cliente de prueba',1,true) as id",
    );
    const member = enrollment.rows[0].id;
    await assert.rejects(
      db.query(
        "update public.loyalty_members set total_stamps=100 where id=$1",
        [member],
      ),
      /permission denied/,
    );
    await assert.rejects(
      db.query(
        "select public.credit_loyalty_purchase($1,1000000,'ILLEGAL',$2)",
        [member, randomUUID()],
      ),
      /ADMIN_REQUIRED/,
    );
    await session(other);
    assert.equal(
      (await db.query("select * from public.loyalty_members")).rows.length,
      0,
    );
    await session(admin, "admin");
    const request = randomUUID();
    await db.query(
      "select public.credit_loyalty_purchase($1,500000,'F-1',$2)",
      [member, request],
    );
    const retry = await db.query<{ result: { duplicate: boolean } }>(
      "select public.credit_loyalty_purchase($1,500000,'F-1',$2) as result",
      [member, request],
    );
    assert.equal(retry.rows[0].result.duplicate, true);
    await assert.rejects(
      db.query("select public.credit_loyalty_purchase($1,500000,'F-1',$2)", [
        member,
        randomUUID(),
      ]),
      /duplicate key/,
    );
    await db.query(
      "select public.credit_loyalty_purchase($1,500000,'F-2',$2)",
      [member, randomUUID()],
    );
    await db.query(
      "select public.credit_loyalty_purchase($1,5000000,'F-3',$2)",
      [member, randomUUID()],
    );
    const card = await db.query<{
      total_stamps: number;
      remainder_cents: number;
    }>(
      "select total_stamps,remainder_cents from public.loyalty_members where id=$1",
      [member],
    );
    assert.equal(Number(card.rows[0].total_stamps), 6);
    assert.equal(Number(card.rows[0].remainder_cents), 0);
    const reward = (
      await db.query<{ id: string }>(
        "select id from public.loyalty_rewards where member_id=$1",
        [member],
      )
    ).rows[0].id;
    await assert.rejects(
      db.query("select public.redeem_loyalty_reward($1,'F-3',2000000,$2)", [
        reward,
        randomUUID(),
      ]),
      /USE_NEW_PURCHASE/,
    );
    const redemption = randomUUID();
    const redeemed = await db.query<{ result: { discount_cents: number } }>(
      "select public.redeem_loyalty_reward($1,'F-4',2000000,$2) as result",
      [reward, redemption],
    );
    assert.equal(redeemed.rows[0].result.discount_cents, 300000);
    await db.query("select public.redeem_loyalty_reward($1,'F-4',2000000,$2)", [
      reward,
      redemption,
    ]);
    await assert.rejects(
      db.query("select public.redeem_loyalty_reward($1,'F-5',2000000,$2)", [
        reward,
        randomUUID(),
      ]),
      /REWARD_ALREADY_REDEEMED/,
    );
    const after = await db.query<{
      total_stamps: number;
      remainder_cents: number;
    }>(
      "select total_stamps,remainder_cents from public.loyalty_members where id=$1",
      [member],
    );
    assert.equal(Number(after.rows[0].total_stamps), 7);
    assert.equal(Number(after.rows[0].remainder_cents), 700000);
    assert.ok(
      (await db.query("select * from public.admin_audit")).rows.length >= 9,
    );
    await session(customer);
    assert.equal(
      (await db.query("select * from public.loyalty_rewards")).rows.length,
      1,
    );
    assert.equal(
      (await db.query("select * from public.admin_audit")).rows.length,
      0,
    );
    await db.exec("reset role; set role anon");
    await assert.rejects(
      db.query("select * from public.loyalty_members"),
      /permission denied/,
    );
  } finally {
    await db.close();
  }
});
