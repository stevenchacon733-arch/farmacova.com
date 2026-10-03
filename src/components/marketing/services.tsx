import Link from "next/link";
import { Pill, ShieldPlus, Syringe } from "lucide-react";

const services = [
  {
    id: "medicamentos",
    title: "Venta de medicamentos",
    description:
      "Encuentra tus medicamentos y confirma su disponibilidad en sucursal.",
    icon: Pill,
    link: "/sucursales",
    action: "Encontrar sucursal",
  },
  {
    id: "vacunas",
    title: "Aplicación de vacunas",
    description:
      "Conoce las vacunas disponibles y los requisitos de aplicación en Farmacova.",
    icon: ShieldPlus,
    link: "/sucursales?servicio=vacunas",
    action: "Ver disponibilidad",
  },
  {
    id: "inyectables",
    title: "Aplicación de inyectables",
    description:
      "Confirma los requisitos, horarios y disponibilidad del servicio en sucursal.",
    icon: Syringe,
    link: "/sucursales?servicio=inyectables",
    action: "Ver disponibilidad",
  },
];

export function Services() {
  return (
    <section id="servicios" className="scroll-mt-8">
      <span className="eyebrow">Siempre cerca de ti</span>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-blue-950">
        Tres formas de cuidarte
      </h2>
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.id}
            className="rounded-sm border border-slate-200 bg-white p-7"
          >
            <service.icon
              size={32}
              strokeWidth={1.5}
              className="text-green-700"
              aria-hidden="true"
            />
            <h3 className="mt-5 text-xl font-bold text-blue-950">
              {service.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-500">
              {service.description}
            </p>
            <Link
              href={service.link}
              className="mt-5 inline-block text-sm font-semibold text-blue-800 underline underline-offset-4"
            >
              {service.action}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
