import Link from "next/link";
import { requireAdmin } from "@/lib/management";
import { isDemoMode } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Administración Farmacova",
  robots: { index: false, follow: false },
};
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return (
    <div className="shell py-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="eyebrow">Farmacova · Administración</span>
          <p className="mt-2 text-sm text-slate-500">
            Tu farmacia, desde un solo lugar.
          </p>
        </div>
        <Link href="/" className="btn-secondary">
          Ver sitio
        </Link>
      </div>
      <nav
        aria-label="Administración"
        className="mb-8 flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3"
      >
        {[
          ["/administracion", "Resumen"],
          ["/administracion/productos", "Productos y precios"],
          ["/administracion/anuncios", "Ofertas y anuncios"],
          ["/administracion/clientes", "Clientes y cupones"],
          ["/administracion/sucursales", "Sucursales"],
          ["/administracion/configuracion", "Configuración"],
          ["/administracion/historial", "Historial"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-blue-900 shadow-sm hover:bg-blue-50"
          >
            {label}
          </Link>
        ))}
      </nav>
      {isDemoMode() && (
        <p
          role="status"
          className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          Vista de demostración: los cambios del panel se guardan solo en este
          navegador. No representan inventario ni compras reales. El acceso real
          exige una cuenta administradora.
        </p>
      )}
      {children}
    </div>
  );
}
