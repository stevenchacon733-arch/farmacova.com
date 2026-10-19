import Link from "next/link";
import type { Metadata } from "next";
import { Phone, ExternalLink, Camera } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/catalog";
import {
  initialBranches,
  brandContact,
  phoneHref,
  mapsHref,
  branchCoordinates,
  type Branch,
} from "@/lib/branches";
import { BranchLocator } from "@/components/branches/branch-locator";

export const metadata: Metadata = {
  title: "Nuestras sucursales",
  description:
    "Ubicaciones, horarios y teléfonos de Farmacova en Aguas Zarcas, Ciudad Quesada, Venecia y Pital.",
};
export const dynamic = "force-dynamic";

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; servicio?: string }>;
}) {
  const { producto, servicio } = await searchParams;
  let branches: Branch[] = initialBranches;
  if (!isDemoMode()) {
    const client = await createClient();
    const { data, error } = await client
      .from("branches")
      .select("*")
      .eq("published", true)
      .order("name");
    if (error) throw new Error("No pudimos cargar las sucursales.");
    // Si la base aún no tiene localidad o coordenadas, usar las conocidas.
    branches = (data ?? []).map((row: Branch) => {
      const known = initialBranches.find((branch) => branch.id === row.id);
      return {
        ...row,
        city: row.city || known?.city || "",
        latitude: row.latitude ?? known?.latitude ?? null,
        longitude: row.longitude ?? known?.longitude ?? null,
      };
    });
  }
  const product = typeof producto === "string" ? producto.slice(0, 120) : "";
  const service =
    servicio === "vacunas"
      ? "Aplicación de vacunas"
      : servicio === "inyectables"
        ? "Aplicación de inyectables"
        : null;
  // Datos estructurados para que Google muestre cada sucursal como farmacia.
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": branches.map((branch) => ({
      "@type": "Pharmacy",
      name: branch.name,
      telephone: `+506 ${branch.phone}`,
      address: {
        "@type": "PostalAddress",
        streetAddress: branch.address,
        addressCountry: "CR",
      },
      hasMap: mapsHref(branch),
      ...(branchCoordinates(branch) && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: branchCoordinates(branch)![0],
          longitude: branchCoordinates(branch)![1],
        },
      }),
    })),
  };
  return (
    <div className="shell py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <span className="eyebrow">Farmacova, cerca de ti</span>
      <p className="mt-3 max-w-3xl leading-relaxed text-slate-600">
        Elige tu ciudad, toca una sucursal para verla en el mapa y llama o pide
        la ruta para confirmar productos, horarios y servicios disponibles.
      </p>
      {(product || service) && (
        <div className="mt-6 border-l-4 border-green-600 bg-green-50 p-4 text-sm font-semibold text-blue-900">
          {product && <p>Producto de interés: {product}</p>}
          {service && <p>Servicio: {service}</p>}
        </div>
      )}
      {branches.length ? (
        <BranchLocator branches={branches} />
      ) : (
        <p className="mt-8 bg-slate-50 p-8 text-slate-600">
          Estamos actualizando nuestras ubicaciones. Comunícate con atención
          central.
        </p>
      )}
      <div className="mt-8 flex flex-col justify-between gap-5 border-y border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm text-slate-600">Atención central Farmacova</p>
          <a
            href={phoneHref(brandContact.phone)}
            className="mt-2 inline-flex items-center gap-2 text-2xl font-bold text-blue-900"
          >
            <Phone size={22} aria-hidden="true" />
            {brandContact.phone}
          </a>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-semibold text-blue-800">
          <a
            href={brandContact.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-green-700"
          >
            <Camera size={20} aria-hidden="true" /> Instagram
          </a>
          <a
            href={brandContact.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-green-700"
          >
            <ExternalLink size={20} aria-hidden="true" /> Facebook
          </a>
        </div>
      </div>
      <p className="mt-8 text-sm leading-relaxed text-slate-500">
        La disponibilidad de medicamentos, vacunas e inyectables y los
        requisitos de aplicación se confirman directamente con cada sucursal.
      </p>
      <Link href="/promociones" className="btn-secondary mt-6">
        Ver promociones del mes
      </Link>
    </div>
  );
}
