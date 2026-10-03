import Link from "next/link";
import { BadgePercent, Pill, ShieldPlus, Syringe } from "lucide-react";
import {
  categories,
  getCollectionProducts,
  getSponsoredAd,
  isDemoMode,
} from "@/lib/catalog";
import { getCampaigns } from "@/lib/campaigns-server";
import { CampaignCarousel } from "@/components/marketing/campaign-carousel";
import { ProductCard } from "@/components/catalog/product-card";
import { CategoryIcon } from "@/components/ui/category-icon";
import { SponsoredModal } from "@/components/ads/sponsored-modal";
import { Services } from "@/components/marketing/services";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [bestsellers, featured, ad, campaigns] = await Promise.all([
    getCollectionProducts("mas-vendidos"),
    getCollectionProducts("destacados"),
    getSponsoredAd(),
    getCampaigns(),
  ]);
  return (
    <>
      <div className="shell pt-6">
        <CampaignCarousel campaigns={campaigns} demo={isDemoMode()} />
      </div>
      <div className="shell flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-b border-slate-100 py-6 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-2">
          <Pill size={15} className="text-blue-800" aria-hidden="true" /> Venta
          de medicamentos
        </span>
        <span className="flex items-center gap-2">
          <ShieldPlus size={15} className="text-blue-800" aria-hidden="true" />{" "}
          Aplicación de vacunas
        </span>
        <span className="flex items-center gap-2">
          <Syringe size={15} className="text-blue-800" aria-hidden="true" />{" "}
          Aplicación de inyectables
        </span>
        <Link href="/promociones" className="flex items-center gap-2">
          <BadgePercent
            size={15}
            className="text-blue-800"
            aria-hidden="true"
          />{" "}
          Promociones y campañas
        </Link>
      </div>
      <section
        className="shell py-12 text-center"
        aria-labelledby="welcome-title"
      >
        <span className="eyebrow">CUIDAMOS DE TI</span>
        <h2
          id="welcome-title"
          className="mx-auto mt-4 max-w-3xl text-2xl font-medium leading-snug tracking-tight text-blue-950 sm:text-3xl"
        >
          Tu farmacia para encontrar medicamentos,
          <br className="hidden sm:block" /> descubrir promociones y cuidar de
          tu bienestar.
        </h2>
        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/catalogo?categoria=${category.slug}`}
              className="group flex flex-col items-center gap-3"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-50 text-blue-800 transition group-hover:bg-blue-50">
                <CategoryIcon
                  name={category.icon}
                  size={37}
                  strokeWidth={1.3}
                />
              </div>
              <h3 className="text-sm font-medium text-slate-700">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>
      <section className="shell pb-12">
        <div className="grid overflow-hidden rounded-2xl bg-slate-50 md:grid-cols-2">
          <div className="flex min-h-64 items-center justify-center gap-7 bg-blue-50 px-8 py-12 text-blue-800">
            <Pill size={64} strokeWidth={1.1} aria-hidden="true" />
            <div className="h-20 border-l border-blue-200" aria-hidden="true" />
            <Syringe size={64} strokeWidth={1.1} aria-hidden="true" />
          </div>
          <div className="p-8 sm:p-10">
            <span className="eyebrow">Farmacova, siempre cerca</span>
            <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-tight text-blue-950">
              Medicamentos, vacunas
              <br />e inyectables en un lugar.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Conoce nuestros servicios y confirma los productos, requisitos y
              horarios disponibles en tu sucursal.
            </p>
            <Link href="/servicios" className="btn-primary mt-6">
              Conocer nuestros servicios
            </Link>
          </div>
        </div>
      </section>
      <section
        id="mas-vendidos"
        className="shell py-6"
        aria-labelledby="bestseller-title"
      >
        <h2
          id="bestseller-title"
          className="text-center text-3xl font-semibold tracking-tight text-blue-950"
        >
          Nuestros más vendidos
        </h2>
        {isDemoMode() && (
          <p className="mt-3 text-center text-xs text-slate-500">
            Selección de ejemplo; el orden se actualizará con las ventas reales
            de Farmacova.
          </p>
        )}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {bestsellers.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
        {!bestsellers.length && (
          <p className="mt-6 text-center text-slate-500">
            Pronto encontrarás aquí los más vendidos.
          </p>
        )}
        <div className="mt-7 text-center">
          <Link href="/catalogo?coleccion=mas-vendidos" className="btn-primary">
            Ver más vendidos
          </Link>
        </div>
      </section>
      <section className="shell py-12" aria-labelledby="featured-title">
        <h2
          id="featured-title"
          className="text-center text-3xl font-semibold tracking-tight text-blue-950"
        >
          Productos que vale la pena conocer
        </h2>
        <p className="mt-3 text-center text-sm text-slate-500">
          Explora nuestra selección de destacados.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
      <section className="shell">
        <div className="flex flex-col justify-between gap-6 rounded-2xl bg-blue-800 p-8 text-white md:flex-row md:items-center">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-100">
              Promociones Farmacova
            </span>
            <h2 className="mt-3 text-2xl font-semibold">
              Descubre nuestras campañas.
            </h2>
            <p className="mt-3 text-sm text-blue-100">
              Productos destacados y espacios patrocinados por laboratorios.
            </p>
          </div>
          <Link
            href="/promociones"
            className="shrink-0 rounded-full bg-white px-6 py-3 text-center text-sm font-bold text-blue-950 hover:bg-green-50"
          >
            Ver promociones
          </Link>
        </div>
      </section>
      <div className="shell mt-12">
        <Services />
      </div>
      <section className="shell mt-12">
        <div className="flex flex-col justify-between gap-6 rounded-2xl border border-slate-200 p-8 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-blue-950">
              Completa 6 sellos. Recibe un 15% de descuento.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Cada ₡10.000 en compras en la farmacia te da un sello. Únete al
              Club Farmacova y lleva tu tarjeta contigo.
            </p>
          </div>
          <Link href="/fidelidad" className="btn-primary shrink-0">
            Conocer mi tarjeta
          </Link>
        </div>
      </section>
      <SponsoredModal ad={ad} />
    </>
  );
}
