"use client";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import {
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ChevronDown,
} from "lucide-react";
import {
  branchCity,
  branchCoordinates,
  directionsHref,
  openNow,
  phoneHref,
  wazeHref,
  whatsappHref,
  type Branch,
} from "@/lib/branches";

const ALL = "todas";
// Centro de la zona norte de Alajuela, por si ninguna sucursal tiene pin.
const DEFAULT_CENTER: [number, number] = [10.38, -84.34];
const PIN = "/images/farmacova-pin.png";

function pinHtml(selected: boolean) {
  return `<span class="branch-pin${selected ? " branch-pin--active" : ""}"><img src="${PIN}" alt="" /></span>`;
}

// Centrar el mapa suavemente en la sucursal elegida.
function flyTo(map: LeafletMap, marker: Marker) {
  map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), {
    duration: 0.8,
  });
}

// Referencia corta para la lista: sin códigos Plus como "9MG6+345".
function shortAddress(address: string) {
  const parts = address
    .split(/(?<=\.)\s|,\s/)
    .map((part) => part.trim())
    .filter((part) => part && !/^[2-9A-Z]{4,8}\+[2-9A-Z]{0,3}$/.test(part));
  const text =
    (parts[0]?.length ?? 0) < 20 ? parts.slice(0, 2).join(", ") : parts[0];
  const short = text || address;
  return short.length > 70 ? `${short.slice(0, 67)}…` : short;
}

export function BranchLocator({ branches }: { branches: Branch[] }) {
  const cities = useMemo(
    () =>
      [...new Set(branches.map(branchCity))].sort((a, b) =>
        a.localeCompare(b, "es"),
      ),
    [branches],
  );
  const [city, setCity] = useState(ALL);
  const visible = useMemo(
    () =>
      city === ALL
        ? branches
        : branches.filter((branch) => branchCity(branch) === city),
    [branches, city],
  );
  const [selectedId, setSelectedId] = useState(branches[0]?.id ?? "");
  const selected =
    visible.find((branch) => branch.id === selectedId) ?? visible[0];
  // La hora se calcula en el navegador para no desfasar el HTML del servidor.
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const mapElement = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const markers = useRef(new Map<string, Marker>());
  const leaflet = useRef<typeof import("leaflet") | null>(null);
  const [ready, setReady] = useState(false);

  // Crear el mapa una sola vez; Leaflet solo funciona en el navegador.
  useEffect(() => {
    let cancelled = false;
    const pins = markers.current;
    void import("leaflet").then((module) => {
      const L = module.default ?? module;
      if (cancelled || !mapElement.current) return;
      leaflet.current = L;
      const instance = L.map(mapElement.current, {
        center: DEFAULT_CENTER,
        zoom: 11,
        scrollWheelZoom: false,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(instance);
      for (const branch of branches) {
        const point = branchCoordinates(branch);
        if (!point) continue;
        const marker = L.marker(point, {
          title: branch.name,
          alt: branch.name,
          icon: L.divIcon({
            html: pinHtml(false),
            className: "",
            iconSize: [40, 48],
            iconAnchor: [20, 48],
          }),
        });
        marker.on("click", () => {
          setSelectedId(branch.id);
          flyTo(instance, marker);
        });
        pins.set(branch.id, marker);
      }
      map.current = instance;
      setReady(true);
    });
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
      pins.clear();
    };
  }, [branches]);

  // Mostrar solo los pines de la ciudad elegida y encuadrarlos.
  useEffect(() => {
    const L = leaflet.current;
    const instance = map.current;
    if (!ready || !L || !instance) return;
    const ids = new Set(visible.map((branch) => branch.id));
    const points: [number, number][] = [];
    for (const [id, marker] of markers.current) {
      if (ids.has(id)) {
        marker.addTo(instance);
        points.push([marker.getLatLng().lat, marker.getLatLng().lng]);
      } else marker.remove();
    }
    if (points.length > 1)
      instance.fitBounds(L.latLngBounds(points), {
        padding: [48, 48],
        maxZoom: 15,
      });
    else if (points.length === 1) instance.setView(points[0], 15);
  }, [ready, visible]);

  // Resaltar el pin activo.
  const selectedKey = selected?.id ?? "";
  useEffect(() => {
    const L = leaflet.current;
    if (!ready || !L) return;
    for (const [id, marker] of markers.current) {
      const active = id === selectedKey;
      marker.setIcon(
        L.divIcon({
          html: pinHtml(active),
          className: "",
          iconSize: active ? [48, 58] : [40, 48],
          iconAnchor: active ? [24, 58] : [20, 48],
        }),
      );
      marker.setZIndexOffset(active ? 1000 : 0);
    }
  }, [ready, selectedKey]);

  function choose(id: string) {
    setSelectedId(id);
    const marker = markers.current.get(id);
    if (map.current && marker) flyTo(map.current, marker);
    // En móvil el mapa queda arriba: volver a él para ver el pin.
    const element = mapElement.current;
    if (
      element &&
      window.matchMedia("(max-width: 1023px)").matches &&
      element.getBoundingClientRect().top < 0
    )
      element.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const status = selected && now ? openNow(selected, now) : null;
  const waze = selected ? wazeHref(selected) : null;
  const whatsapp = selected ? whatsappHref(selected) : null;

  return (
    <section
      aria-labelledby="branch-locator-title"
      className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 bg-blue-950 px-5 py-4 text-white sm:flex-row sm:items-center sm:justify-between">
        <h1 id="branch-locator-title" className="text-2xl font-bold">
          Nuestras sucursales
        </h1>
        <label className="relative block sm:w-60">
          <span className="sr-only">Filtrar por ciudad</span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none rounded-lg border-0 bg-white py-2.5 pl-4 pr-10 text-sm font-semibold text-blue-950 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={ALL}>Todas las ciudades</option>
            {cities.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-blue-950"
          />
        </label>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <div className="relative scroll-mt-24">
          <div
            ref={mapElement}
            role="region"
            aria-label="Mapa de sucursales"
            className="branch-map h-[320px] w-full bg-blue-50 sm:h-[400px] lg:h-[520px]"
          />
        </div>
        <ul
          aria-label="Lista de sucursales"
          className="max-h-[420px] divide-y divide-slate-100 overflow-y-auto border-t border-slate-200 lg:h-[520px] lg:max-h-none lg:border-l lg:border-t-0"
        >
          {visible.map((branch) => {
            const active = branch.id === selected?.id;
            return (
              <li
                key={branch.id}
                className={`flex gap-3 border-l-4 p-4 transition-colors ${active ? "border-green-500 bg-green-50" : "border-transparent hover:bg-slate-50"}`}
              >
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 bg-white ${active ? "border-green-500" : "border-blue-950"}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={PIN} alt="" width={26} height={26} />
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => choose(branch.id)}
                    aria-pressed={active}
                    className="block w-full text-left"
                  >
                    <span className="block font-bold text-blue-950">
                      {branch.name}
                    </span>
                    <span className="mt-1 block text-sm leading-snug text-slate-500">
                      {shortAddress(branch.address)}
                    </span>
                  </button>
                  {branch.phone && (
                    <a
                      href={phoneHref(branch.phone)}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-800"
                    >
                      <Phone size={15} aria-hidden="true" />
                      {branch.phone}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
          {!visible.length && (
            <li className="p-6 text-sm text-slate-500">
              No hay sucursales en esta ciudad.
            </li>
          )}
        </ul>
      </div>

      {selected && (
        <div
          aria-live="polite"
          className="grid gap-6 border-t border-slate-200 bg-slate-50 p-5 sm:p-7 md:grid-cols-[minmax(0,1fr)_auto] md:items-start"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-green-700">
              Sucursal seleccionada · {branchCity(selected)}
            </p>
            <h3 className="mt-1 text-2xl font-bold text-blue-950">
              {selected.name}
            </h3>
            <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              <div>
                <dt className="flex items-center gap-1.5 font-semibold text-blue-950">
                  <MapPin size={16} aria-hidden="true" /> Dirección
                </dt>
                <dd className="mt-1 leading-relaxed text-slate-600">
                  {selected.address}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-semibold text-blue-950">
                  <Phone size={16} aria-hidden="true" /> Teléfono
                </dt>
                <dd className="mt-1 flex flex-col gap-1">
                  {[selected.phone, selected.secondary_phone]
                    .filter(Boolean)
                    .map((phone) => (
                      <a
                        key={phone}
                        href={phoneHref(phone!)}
                        className="font-bold text-blue-600 hover:text-blue-800"
                      >
                        {phone}
                      </a>
                    ))}
                  {whatsapp && (
                    <a
                      href={whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-green-700 hover:text-green-800"
                    >
                      <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                    </a>
                  )}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-semibold text-blue-950">
                  <Clock size={16} aria-hidden="true" /> Horario
                </dt>
                <dd className="mt-1 text-slate-600">
                  <span className="block">
                    {selected.hours ||
                      "Horario por confirmar. Llámanos antes de tu visita."}
                  </span>
                  {status !== null && (
                    <span
                      className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${status ? "bg-green-100 text-green-800" : "bg-red-50 text-red-700"}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full ${status ? "bg-green-600" : "bg-red-600"}`}
                      />
                      {status ? "Abierto ahora" : "Cerrado ahora"}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
            <a
              href={directionsHref(selected)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Cómo llegar a ${selected.name} con Google Maps`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-blue-950 hover:bg-green-400"
            >
              <Navigation size={18} aria-hidden="true" />
              Cómo llegar
            </a>
            {waze && (
              <a
                href={waze}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Cómo llegar a ${selected.name} con Waze`}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-blue-200 bg-white px-6 py-3 text-sm font-semibold text-blue-950 hover:bg-blue-50"
              >
                Abrir en Waze
              </a>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
