import Link from "next/link";
import { Brand } from "./brand";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-10">
      <div className="shell flex flex-col justify-between gap-8 md:flex-row">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Medicamentos, vacunas e inyectables. Cuidamos de ti.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <Link href="/promociones">Promociones</Link>
          <Link href="/servicios">Nuestros servicios</Link>
          <Link href="/auth?mode=registro">Crear mi perfil</Link>
          <Link href="/privacidad">Privacidad</Link>
        </div>
      </div>
      <div className="shell mt-8 border-t border-slate-100 pt-6 text-xs leading-relaxed text-slate-500">
        © {new Date().getFullYear()} Farmacova · Costa Rica. Sitio informativo.
        La disponibilidad se confirma en sucursal.
      </div>
    </footer>
  );
}
