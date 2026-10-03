import Link from "next/link";
import { BadgePercent, Search, CreditCard, MapPin } from "lucide-react";
import { Brand } from "./brand";
import { AccountLink } from "../auth/account-link";

export function Navbar() {
  return (
    <header className="relative z-20 bg-blue-950 text-white">
      <div className="border-b border-white/10">
        <div className="shell flex min-h-8 items-center justify-between gap-4 text-xs">
          <span className="text-blue-100">Farmacova · Costa Rica</span>
          <div className="flex items-center gap-4 py-2">
            <Link href="/servicios" className="hover:text-green-300">
              Servicios
            </Link>
            <Link
              href="/sucursales"
              className="flex items-center gap-1.5 hover:text-green-300"
            >
              <MapPin size={13} aria-hidden="true" /> Encuentra tu sucursal
            </Link>
          </div>
        </div>
      </div>
      <div className="shell flex flex-wrap items-center gap-x-8 gap-y-4 py-4">
        <div className="rounded-sm bg-white px-3 py-1">
          <Brand />
        </div>
        <form
          action="/promociones"
          role="search"
          className="order-3 flex w-full items-center border border-blue-200 bg-white text-blue-950 md:order-none md:flex-1"
        >
          <label htmlFor="site-search" className="sr-only">
            Buscar en las promociones del mes
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            maxLength={120}
            placeholder="Busca productos y promociones del mes"
            className="min-w-0 flex-1 bg-transparent px-4 py-4 text-sm outline-none sm:text-base"
          />
          <button
            type="submit"
            aria-label="Buscar promociones"
            className="px-4 py-3 text-blue-950 hover:text-green-700"
          >
            <Search size={28} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </form>
        <div className="ml-auto flex items-center gap-4 md:ml-0">
          <AccountLink dark />
          <Link
            href="/fidelidad"
            className="flex flex-col items-center gap-1 text-white hover:text-green-300"
          >
            <CreditCard size={25} strokeWidth={1.6} aria-hidden="true" />
            <span className="text-xs">Mi tarjeta</span>
          </Link>
        </div>
      </div>
      <nav
        aria-label="Navegación principal"
        className="shell flex items-stretch gap-x-1 overflow-x-auto whitespace-nowrap text-sm sm:gap-x-4 [&>a]:shrink-0"
      >
        <Link
          href="/promociones"
          className="flex items-center gap-2 bg-green-600 px-5 py-4 font-bold hover:bg-green-700"
        >
          <BadgePercent size={19} aria-hidden="true" /> Ofertas
        </Link>
        <Link href="/" className="px-4 py-4 font-medium hover:bg-white/10">
          Inicio
        </Link>
        <Link
          href="/servicios"
          className="px-4 py-4 font-medium hover:bg-white/10"
        >
          Vacunas e inyectables
        </Link>
        <Link
          href="/sucursales"
          className="px-4 py-4 font-medium hover:bg-white/10"
        >
          Sucursales
        </Link>
        <Link
          href="/fidelidad"
          className="px-4 py-4 font-medium hover:bg-white/10"
        >
          Club Farmacova
        </Link>
      </nav>
      <Link
        href="/fidelidad"
        className="block bg-green-600 px-5 py-3 text-center text-sm font-semibold hover:bg-green-700"
      >
        Tus compras tienen recompensa: completa 6 sellos y recibe un 15% de
        descuento
      </Link>
    </header>
  );
}
