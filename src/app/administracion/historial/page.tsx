import { requireAdmin } from "@/lib/management";
export default async function HistoryPage() {
  const client = await requireAdmin();
  const result = client
    ? await client
        .from("admin_audit")
        .select("id,actor,entity,entity_id,operation,changed_fields,created_at")
        .order("created_at", { ascending: false })
        .limit(100)
    : { data: [], error: null };
  if (result.error) throw new Error("No pudimos cargar el historial.");
  return (
    <>
      <h1 className="text-3xl font-bold text-blue-950">Historial de cambios</h1>
      <p className="mt-3 text-sm text-slate-500">
        Últimas 100 operaciones. Las compras y canjes quedan registrados sin
        posibilidad de editar su saldo desde el navegador.
      </p>
      <div className="mt-7 space-y-3">
        {result.data?.map((row) => (
          <article
            key={row.id}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <p className="font-bold text-blue-950">
              {row.entity} · {row.operation}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {new Date(row.created_at).toLocaleString("es-CR", {
                timeZone: "America/Costa_Rica",
              })}
            </p>
            <p className="mt-2 break-all font-mono text-xs text-slate-500">
              Registro: {row.entity_id} · Usuario: {row.actor ?? "Sistema"}
            </p>
            {row.changed_fields?.length > 0 && (
              <p className="mt-2 text-xs text-slate-600">
                Campos: {row.changed_fields.join(", ")}
              </p>
            )}
          </article>
        ))}
        {!result.data?.length && (
          <p className="rounded-2xl bg-slate-50 p-6 text-slate-500">
            El historial aparecerá cuando registres cambios con Supabase
            conectado.
          </p>
        )}
      </div>
    </>
  );
}
