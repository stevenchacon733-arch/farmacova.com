import Link from "next/link";
import type { Metadata } from "next";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/catalog";
import type { Branch } from "@/lib/management";

export const metadata: Metadata = { title: "Disponibilidad en sucursal" };
export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; servicio?: string }>;
}) {
  const { producto, servicio } = await searchParams;
  let branches: Branch[] = [];
  if (!isDemoMode()) {
    const client = await createClient();
    const { data, error } = await client
      .from("branches")
      .select("id,name,address,phone,hours,published")
      .eq("published", true)
      .order("name");
    if (error) throw new Error("No pudimos cargar las sucursales.");
    branches = data ?? [];
  }
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
        {!branches.length && (
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Las direcciones, teléfonos y horarios oficiales se publicarán aquí
            cuando estén confirmados.
          </p>
        )}
        {branches.map((branch) => (
          <article
            key={branch.id}
            className="mt-6 rounded-2xl border border-slate-200 bg-white p-5"
          >
            <h2 className="text-xl font-bold text-blue-950">{branch.name}</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
              {branch.address}
            </p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
              {branch.hours}
            </p>
            {branch.phone && (
              <a
                className="mt-4 inline-block font-semibold text-blue-800 underline"
                href={`tel:${branch.phone.replace(/[^+0-9]/g, "")}`}
              >
                {branch.phone}
              </a>
            )}
          </article>
        ))}
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
