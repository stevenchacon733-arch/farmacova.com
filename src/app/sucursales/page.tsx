import Link from "next/link";
import type { Metadata } from "next";
import {
  MapPin,
  Phone,
  Clock,
  Navigation,
  ExternalLink,
  Camera,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isDemoMode } from "@/lib/catalog";
import { normalizeSearch } from "@/lib/validation";
import {
  initialBranches,
  brandContact,
  phoneHref,
  mapsHref,
  safeBranchUrl,
  type Branch,
} from "@/lib/branches";

export const metadata: Metadata = { title: "Nuestras sucursales" };
export const dynamic = "force-dynamic";

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string; servicio?: string; q?: string }>;
}) {
  const { producto, servicio, q } = await searchParams;
  let branches: Branch[] = initialBranches;
  if (!isDemoMode()) {
    const client = await createClient();
    const { data, error } = await client
      .from("branches")
      .select("*")
      .eq("published", true)
      .order("name");
    if (error) throw new Error("No pudimos cargar las sucursales.");
    branches = data ?? [];
  }
  const query = typeof q === "string" ? q.trim().slice(0, 120) : "";
  const words = normalizeSearch(query).split(/\s+/).filter(Boolean);
  const visibleBranches = branches.filter((branch) =>
    words.every((word) =>
      normalizeSearch(`${branch.name} ${branch.address}`).includes(word),
    ),
  );
  const product = typeof producto === "string" ? producto.slice(0, 120) : "";
  const service =
    servicio === "vacunas"
      ? "Aplicación de vacunas"
      : servicio === "inyectables"
        ? "Aplicación de inyectables"
        : null;
  return (
    <div className="shell py-12">
      <span className="eyebrow">Farmacova, cerca de ti</span>
      <h1 className="mt-3 text-4xl font-bold tracking-tight text-blue-950">
        Nuestras sucursales
      </h1>
      <p className="mt-4 max-w-3xl leading-relaxed text-slate-600">
        Encuentra la ubicación que te queda más cerca y comunícate directamente
        para confirmar productos, horarios y servicios disponibles.
      </p>
      {(product || service) && (
        <div className="mt-6 border-l-4 border-green-600 bg-green-50 p-4 text-sm font-semibold text-blue-900">
          {product && <p>Producto de interés: {product}</p>}
          {service && <p>Servicio: {service}</p>}
        </div>
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
      <form
        action="/sucursales"
        role="search"
        className="mt-8 flex flex-col gap-3 sm:flex-row"
      >
        {product && <input type="hidden" name="producto" value={product} />}
        {service && <input type="hidden" name="servicio" value={servicio} />}
        <label htmlFor="branch-query" className="sr-only">
          Buscar sucursal por nombre o localidad
        </label>
        <div className="relative flex-1">
          <Search
            size={19}
            className="absolute left-4 top-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="branch-query"
            name="q"
            type="search"
            maxLength={120}
            defaultValue={query}
            placeholder="Busca por sucursal o localidad"
            className="field"
            style={{ paddingLeft: "2.75rem" }}
          />
        </div>
        <button className="btn-primary">Buscar sucursal</button>
      </form>
      <p className="mt-5 text-sm text-slate-500">
        {visibleBranches.length}{" "}
        {visibleBranches.length === 1 ? "ubicación" : "ubicaciones"}
        {query && ` para “${query}”`}
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visibleBranches.map((branch) => (
          <article
            key={branch.id}
            className="flex flex-col rounded-sm border border-slate-200 bg-white p-6"
          >
            <MapPin size={29} className="text-green-700" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-bold text-blue-950">
              {branch.name}
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {branch.address}
            </p>
            <div className="mt-5 flex items-start gap-2 text-sm text-slate-600">
              <Clock
                size={17}
                className="mt-0.5 shrink-0 text-green-700"
                aria-hidden="true"
              />
              <p className="whitespace-pre-wrap">
                {branch.hours ||
                  "Horario por confirmar. Llámanos antes de tu visita."}
              </p>
            </div>
            <div className="mt-5 flex flex-col gap-3">
              {[branch.phone, branch.secondary_phone]
                .filter(Boolean)
                .map((phone) => (
                  <a
                    key={phone}
                    href={phoneHref(phone!)}
                    className="inline-flex items-center gap-2 font-semibold text-blue-900 hover:text-green-700"
                  >
                    <Phone size={17} aria-hidden="true" />
                    {phone}
                  </a>
                ))}
            </div>
            <div className="mt-auto flex flex-wrap gap-3 pt-6">
              <a
                href={mapsHref(branch)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver ${branch.name} en Google Maps`}
                className="inline-flex items-center gap-2 rounded-sm bg-blue-900 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <MapPin size={16} aria-hidden="true" />
                Google Maps
              </a>
              {branch.waze_url && safeBranchUrl(branch.waze_url, "waze") && (
                <a
                  href={branch.waze_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Llegar a ${branch.name} con Waze`}
                  className="inline-flex items-center gap-2 rounded-sm border border-blue-200 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-50"
                >
                  <Navigation size={16} aria-hidden="true" />
                  Waze
                </a>
              )}
              {branch.facebook_url &&
                safeBranchUrl(branch.facebook_url, "facebook") && (
                  <a
                    href={branch.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Facebook de ${branch.name}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-blue-800 underline"
                  >
                    <ExternalLink size={16} aria-hidden="true" />
                    Facebook
                  </a>
                )}
            </div>
          </article>
        ))}
      </div>
      {!visibleBranches.length && (
        <p className="mt-6 bg-slate-50 p-8 text-slate-600">
          {query
            ? "No encontramos sucursales con ese nombre. Prueba otra localidad."
            : "Estamos actualizando nuestras ubicaciones. Comunícate con atención central."}
        </p>
      )}
      {query && (
        <Link
          href="/sucursales"
          className="mt-6 inline-block font-semibold text-blue-800 underline"
        >
          Ver todas las sucursales
        </Link>
      )}
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
