"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/management";
import { validateRecord, type Entity } from "@/lib/admin-validation";
import { amountToCents } from "@/lib/loyalty";
function message(error: { message: string; code?: string }) {
  if (error.code === "23505")
    return "Esta factura, enlace o identificador ya está registrado. Revisa antes de repetir la operación.";
  if (error.message.includes("REWARD_ALREADY_REDEEMED"))
    return "Este cupón ya fue canjeado.";
  if (error.message.includes("USE_NEW_PURCHASE"))
    return "El descuento se usa en una compra posterior, con una factura nueva.";
  if (error.message.includes("MEMBER_INACTIVE"))
    return "Esta tarjeta está suspendida o no existe.";
  if (error.message.includes("PROGRAM_PAUSED"))
    return "La acumulación está pausada desde Configuración.";
  if (error.message.includes("REQUEST_CONFLICT"))
    return "La operación ya se registró con datos distintos. Revisa el historial.";
  return "No pudimos guardar. Revisa los datos y vuelve a intentarlo.";
}
export async function saveAdminRecord(
  entity: Entity,
  row: unknown,
): Promise<{ error?: string }> {
  const client = await requireAdmin();
  if (!client)
    return {
      error: "Usa la vista de demostración para probar cambios locales.",
    };
  try {
    const valid = validateRecord(
      entity,
      row,
      process.env.NEXT_PUBLIC_SUPABASE_URL,
    );
    const table = {
      productos: "products",
      sucursales: "branches",
      configuracion: "store_settings",
    }[entity];
    let error;
    if (entity === "configuracion") {
      const { program_version: unused, ...settings } =
        valid as import("@/lib/admin-validation").AdminSettings;
      void unused;
      ({ error } = await client
        .from(table)
        .update(settings)
        .eq("id", 1)
        .select("id")
        .single());
    } else {
      ({ error } = await client
        .from(table)
        .upsert(valid as unknown as Record<string, unknown>, {
          onConflict: "id",
        })
        .select("id")
        .single());
    }
    if (error) return { error: message(error) };
    [
      "/",
      "/catalogo",
      "/promociones",
      "/sucursales",
      "/fidelidad",
      "/administracion",
    ].forEach((path) => revalidatePath(path, "layout"));
    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Datos inválidos.",
    };
  }
}
export async function recordPurchase(
  memberId: string,
  amount: string,
  receipt: string,
  requestId: string,
): Promise<{ error?: string; message?: string }> {
  const client = await requireAdmin();
  if (!client)
    return {
      error:
        "Las compras de demostración se registran únicamente en este navegador.",
    };
  try {
    if (
      !/^[a-f0-9-]{36}$/i.test(memberId) ||
      !/^[a-f0-9-]{36}$/i.test(requestId) ||
      typeof receipt !== "string" ||
      !receipt.trim() ||
      receipt.length > 100
    )
      throw new Error("Selecciona un cliente e ingresa una factura válida.");
    const { data, error } = await client.rpc("credit_loyalty_purchase", {
      p_member: memberId,
      p_amount: amountToCents(amount),
      p_receipt: receipt.trim(),
      p_request: requestId,
    });
    if (error) return { error: message(error) };
    revalidatePath("/administracion/clientes");
    revalidatePath("/fidelidad");
    return {
      message: data.duplicate
        ? "Esta operación ya estaba registrada; no se duplicaron los sellos."
        : `Compra registrada: ${data.stamps} sellos añadidos.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Datos inválidos.",
    };
  }
}
export async function redeemReward(
  rewardId: string,
  amount: string,
  receipt: string,
  requestId: string,
): Promise<{ error?: string; message?: string }> {
  const client = await requireAdmin();
  if (!client)
    return {
      error:
        "El canje de demostración se procesa únicamente en este navegador.",
    };
  try {
    if (
      !/^[a-f0-9-]{36}$/i.test(rewardId) ||
      !/^[a-f0-9-]{36}$/i.test(requestId) ||
      typeof receipt !== "string" ||
      !receipt.trim() ||
      receipt.length > 100
    )
      throw new Error("Ingresa los datos de la nueva compra.");
    const { data, error } = await client.rpc("redeem_loyalty_reward", {
      p_reward: rewardId,
      p_amount: amountToCents(amount),
      p_receipt: receipt.trim(),
      p_request: requestId,
    });
    if (error) return { error: message(error) };
    revalidatePath("/administracion/clientes");
    revalidatePath("/fidelidad");
    return {
      message: `Cupón canjeado. Descuento aplicado: ₡${(data.discount_cents / 100).toFixed(2)}.`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Datos inválidos.",
    };
  }
}
export async function setMemberActive(
  id: string,
  active: boolean,
): Promise<{ error?: string }> {
  const client = await requireAdmin();
  if (!client) return { error: "Acción disponible al conectar Supabase." };
  if (typeof active !== "boolean" || !/^[a-f0-9-]{36}$/i.test(id))
    return { error: "Datos inválidos." };
  const { error } = await client
    .from("loyalty_members")
    .update({ active })
    .eq("id", id);
  if (error) return { error: message(error) };
  revalidatePath("/administracion/clientes");
  revalidatePath("/fidelidad");
  return {};
}
