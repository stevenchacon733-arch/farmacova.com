import Link from "next/link";
import {
  BadgePercent,
  MapPin,
  Phone,
  Search,
  Stamp,
  Syringe,
} from "lucide-react";
import { Brand } from "./brand";
import { AccountLink } from "../auth/account-link";
import { brandContact, phoneHref } from "@/lib/branches";

// Accesos directos del encabezado: icono + etiqueta corta.
const shortcuts = [
  { href: "/promociones", label: "Ofertas", icon: BadgePercent, accent: true },
  { href: "/sucursales", label: "Sucursales", icon: MapPin },
  { href: "/fidelidad", label: "Club Farmacova", icon: Stamp },
  { href: "/servicios", label: "Servicios", icon: Syringe },
];

export function Navbar() {
  return (
    <header className="relative z-30 lg:sticky lg:top-0 border-b border-slate-200/80 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="shell flex flex-wrap items-center gap-x-6 gap-y-3 py-3 lg:flex-nowrap lg:gap-x-10">
        <Brand className="w-32 sm:w-36" />
        <form
          action="/promociones"
          role="search"
          className="order-3 flex h-11 w-full items-center rounded-full border border-slate-200 bg-slate-50 pl-4 pr-1 transition focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 lg:order-none lg:mx-auto lg:max-w-xl"
        >
          <label htmlFor="site-search" className="sr-only">
            Buscar en las promociones del mes
          </label>
          <Search
            size={18}
            className="shrink-0 text-slate-400"
            aria-hidden="true"
          />
          <input
            id="site-search"
            name="q"
            type="search"
            maxLength={120}
            placeholder="Busca un producto o una marca"
            className="min-w-0 flex-1 bg-transparent px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="shrink-0 rounded-full bg-blue-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-900"
          >
            Buscar
          </button>
        </form>
        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <nav
            aria-label="Accesos directos"
            className="hidden items-center gap-1 lg:flex"
          >
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`header-shortcut ${item.accent ? "text-green-700" : ""}`}
              >
                <item.icon size={21} strokeWidth={1.7} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <a
            href={phoneHref(brandContact.phone)}
            className="header-shortcut"
            aria-label={`Llamar a la central, ${brandContact.phone}`}
          >
            <Phone size={21} strokeWidth={1.7} aria-hidden="true" />
            <span>{brandContact.phone}</span>
          </a>
          <AccountLink compact />
        </div>
      </div>
      {/* En móvil y tableta los accesos pasan a una fila de chips deslizable. */}
      <nav
        aria-label="Accesos directos"
        className="shell -mt-1 flex gap-2 overflow-x-auto pb-3 [scrollbar-width:none] lg:hidden"
      >
        {shortcuts.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition ${item.accent ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
          >
            <item.icon size={16} strokeWidth={1.8} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
