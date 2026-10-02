import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Disponibilidad en sucursal" };
export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; servicio?: string }>;
}) {
  const { producto, servicio } = await searchParams;
  const service =
    servicio === "vacunas"
      ? "Aplicación de vacunas"
      : servicio === "inyectables"
        ? "Aplicación de inyectables"
        : null;
  return (
    <div className="shell py-12">
      <div className="max-w-2xl rounded-3xl border border-slate-200 bg-slate-50 p-8">
        <MapPin size={34} className="text-green-700" aria-hidden="true" />
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-blue-950">
          Encuéntranos en sucursal
        </h1>
        {typeof producto === "string" && (
          <p className="mt-4 break-words font-semibold text-blue-800">
            Producto de interés: {producto.slice(0, 120)}
          </p>
        )}
        {service && (
          <p className="mt-4 font-semibold text-blue-800">
            Servicio: {service}
          </p>
        )}
        <p className="mt-5 leading-relaxed text-slate-600">
          Farmacova ofrece venta de medicamentos, aplicación de vacunas y
          aplicación de inyectables. La disponibilidad de productos y los
          requisitos de cada servicio se confirman directamente en sucursal.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-500">
          Las direcciones, teléfonos y horarios oficiales se publicarán aquí
          cuando estén confirmados.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/catalogo" className="btn-primary">
            Ver medicamentos
          </Link>
          <Link href="/promociones" className="btn-secondary">
            Ver promociones
          </Link>
        </div>
      </div>
    </div>
  );
}
