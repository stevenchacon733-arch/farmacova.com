import Link from "next/link";
import { requireAdmin } from "@/lib/management";
import { walletConfigured } from "@/lib/wallet/config";
export default async function AdminPage() {
  const client = await requireAdmin();
  const counts = client
    ? await Promise.all(
        [
          "products",
          "hero_campaigns",
          "loyalty_members",
          "loyalty_rewards",
        ].map(async (table) => {
          const { count, error } = await client
            .from(table)
            .select("id", { head: true, count: "exact" });
          if (error)
            throw new Error(
              "Aplica las migraciones de Farmacova para habilitar el panel.",
            );
          return count ?? 0;
        }),
      )
    : [5, 3, 0, 0];
  return (
    <>
      <h1 className="text-3xl font-bold text-blue-950">Así va Farmacova</h1>
      <p className="mt-3 text-slate-500">
        Publica tus productos, destaca promociones y reconoce a tus clientes
        frecuentes.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          "Productos",
          "Campañas",
          "Tarjetas de fidelidad",
          "Cupones emitidos",
        ].map((label, i) => (
          <div key={label} className="rounded-2xl border border-slate-200 p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-4xl font-bold text-blue-800">{counts[i]}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl bg-blue-900 p-8 text-white">
          <span className="text-sm text-blue-200">Club Farmacova</span>
          <h2 className="mt-3 text-3xl font-bold">6 sellos. Un 15% para ti.</h2>
          <p className="mt-4 text-blue-100">
            Cada ₡10.000 en compras completa un sello. Registra las facturas y
            canjea el beneficio en la siguiente compra.
          </p>
          <Link href="/administracion/clientes" className="btn-secondary mt-6">
            Gestionar clientes
          </Link>
        </div>
        <div className="rounded-3xl border border-slate-200 p-8">
          <h2 className="text-xl font-bold text-blue-950">Apple Wallet</h2>
          <p className="mt-4 text-slate-600">
            {walletConfigured()
              ? "Certificados configurados. Prueba la emisión en un iPhone antes de anunciar el servicio."
              : "Pendiente de los certificados de Apple Developer para emitir tarjetas firmadas."}
          </p>
          <Link href="/fidelidad" className="btn-secondary mt-6">
            Ver tarjeta
          </Link>
        </div>
      </div>
    </>
  );
}
