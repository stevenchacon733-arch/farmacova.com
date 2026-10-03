import Link from "next/link";
import { BadgePercent, Menu, Search } from "lucide-react";
import { Brand } from "./brand";
import { AccountLink } from "../auth/account-link";

export function Navbar() {
  return (
    <header className="relative z-20 border-b border-slate-200 bg-white">
      <div className="bg-blue-950 text-blue-50">
        <div className="shell flex min-h-9 items-center justify-between gap-4 py-2 text-xs">
          <span>Medicamentos · Vacunas · Inyectables</span>
          <span>Costa Rica</span>
        </div>
      </div>
      <div className="shell flex flex-wrap items-center gap-x-10 gap-y-5 py-6">
        <Brand />
        <form
          action="/catalogo"
          role="search"
          className="order-3 flex w-full items-center rounded-full border border-slate-200 bg-slate-50 p-1.5 md:order-none md:flex-1"
        >
          <Search
            size={20}
            aria-hidden="true"
            className="ml-4 shrink-0 text-slate-400"
          />
          <label htmlFor="site-search" className="sr-only">
            Buscar en el catálogo
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            maxLength={120}
            placeholder="Busca medicamentos, marcas o categorías"
            className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-blue-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-900"
          >
            Buscar
          </button>
        </form>
        <div className="ml-auto md:ml-0">
          <AccountLink />
        </div>
      </div>
      <nav
        aria-label="Navegación principal"
        className="shell flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pb-4 text-sm"
      >
        <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
          <Link className="nav-link flex items-center gap-2" href="/catalogo">
            <Menu size={17} aria-hidden="true" /> Medicamentos
          </Link>
          <Link className="nav-link" href="/catalogo?coleccion=mas-vendidos">
            Más vendidos
          </Link>
          <Link className="nav-link" href="/catalogo?coleccion=destacados">
            Destacados
          </Link>
          <Link className="nav-link" href="/servicios">
            Vacunas e inyectables
          </Link>
          <Link className="nav-link" href="/sucursales">
            Sucursales
          </Link>
        </div>
        <Link
          className="nav-link font-semibold text-blue-800"
          href="/fidelidad"
        >
          Club Farmacova · 15%
        </Link>
        <Link
          href="/promociones"
          className="flex items-center gap-2 font-semibold text-green-700 hover:text-green-800"
        >
          <BadgePercent size={18} aria-hidden="true" /> Promociones
        </Link>
      </nav>
    </header>
  );
}
