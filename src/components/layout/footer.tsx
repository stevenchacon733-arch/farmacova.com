import Link from "next/link";
import { Brand } from "./brand";
import { ExternalLink, Camera, Phone } from "lucide-react";
import { brandContact, phoneHref } from "@/lib/branches";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-10">
      <div className="shell flex flex-col justify-between gap-8 md:flex-row">
        <div>
          <Brand />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Medicamentos, vacunas e inyectables. Cuidamos de ti.
          </p>
          <a
            href={phoneHref(brandContact.phone)}
            className="mt-4 inline-flex items-center gap-2 font-semibold text-blue-900"
          >
            <Phone size={17} aria-hidden="true" /> Central: {brandContact.phone}
          </a>
          <div className="mt-4 flex gap-5 text-sm font-semibold text-blue-800">
            <a
              href={brandContact.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-green-700"
            >
              <Camera size={19} aria-hidden="true" /> Instagram
            </a>
            <a
              href={brandContact.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 hover:text-green-700"
            >
              <ExternalLink size={19} aria-hidden="true" /> Facebook
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
          <Link href="/promociones">Promociones</Link>
          <Link href="/servicios">Nuestros servicios</Link>
          <Link href="/sucursales">Sucursales</Link>
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
