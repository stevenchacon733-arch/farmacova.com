import Link from "next/link";
import { ArrowUpRight, MapPin, Pill, ShieldPlus, Syringe } from "lucide-react";

const services = [
  {
    id: "medicamentos",
    title: "Medicamentos",
    description: "Con y sin receta",
    icon: Pill,
    link: "/sucursales",
  },
  {
    id: "vacunas",
    title: "Vacunas",
    description: "Aplicación en sucursal",
    icon: ShieldPlus,
    link: "/sucursales?servicio=vacunas",
  },
  {
    id: "inyectables",
    title: "Inyectables",
    description: "Con receta médica",
    icon: Syringe,
    link: "/sucursales?servicio=inyectables",
  },
  {
    id: "sucursales",
    title: "Sucursales",
    description: "Horarios y ubicación",
    icon: MapPin,
    link: "/sucursales",
  },
];

// Accesos compactos: icono, título y una línea; el detalle vive en /sucursales.
export function Services() {
  return (
    <section
      id="servicios"
      aria-labelledby="services-title"
      className="scroll-mt-8"
    >
      <h2
        id="services-title"
        className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl"
      >
        Cuidamos de ti
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {services.map((service) => (
          <Link
            key={service.id}
            href={service.link}
            className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 transition hover:border-slate-300 hover:shadow-lg hover:shadow-blue-950/5 sm:p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-700">
              <service.icon size={22} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <h3 className="mt-4 font-semibold text-blue-950">
              {service.title}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">
              {service.description}
            </p>
            <ArrowUpRight
              size={18}
              className="absolute right-4 top-4 text-slate-300 transition group-hover:text-blue-800"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
