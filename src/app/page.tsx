import Link from "next/link";
import { ArrowRight, BadgePercent, MapPin, CreditCard } from "lucide-react";
import { searchProducts, getSponsoredAd, isDemoMode } from "@/lib/catalog";
import { getCampaigns } from "@/lib/campaigns-server";
import { CampaignCarousel } from "@/components/marketing/campaign-carousel";
import { PromotionCard } from "@/components/catalog/promotion-card";
import { OffersRail } from "@/components/marketing/offers-rail";
import { SponsoredModal } from "@/components/ads/sponsored-modal";
import { Services } from "@/components/marketing/services";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [promotions, ad, campaigns] = await Promise.all([
    searchProducts("", "", 1, "promociones"),
    getSponsoredAd(),
    getCampaigns(),
  ]);
  return (
    <>
      <h1 className="sr-only">Farmacova: promociones y productos del mes</h1>
      <div className="border-b border-slate-200 bg-white">
        <div className="shell grid grid-cols-3 divide-x divide-slate-200 text-center text-xs sm:text-sm">
          <p className="px-4 py-4">
            <strong className="text-green-700">Productos del mes</strong>
            <br />
            <span className="mt-1 hidden text-slate-600 sm:inline-block">
              Promociones seleccionadas para ti
            </span>
          </p>
          <p className="px-4 py-4">
            <strong className="text-green-700">Club Farmacova</strong>
            <br />
            <span className="mt-1 hidden text-slate-600 sm:inline-block">
              6 sellos, un 15% de descuento
            </span>
          </p>
          <p className="px-4 py-4">
            <strong className="text-green-700">Cuidamos de ti</strong>
            <br />
            <span className="mt-1 hidden text-slate-600 sm:inline-block">
              Medicamentos, vacunas e inyectables
            </span>
          </p>
        </div>
      </div>
      <CampaignCarousel campaigns={campaigns} demo={isDemoMode()} />
      <section
        id="promociones-del-mes"
        className="shell py-10 sm:py-12"
        aria-labelledby="promotions-title"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2
              id="promotions-title"
              className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl"
            >
              Promociones del mes
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Descubre los productos seleccionados por Farmacova. Condiciones y
              disponibilidad en sucursal.
            </p>
          </div>
          <Link
            href="/promociones"
            className="inline-flex items-center gap-3 font-semibold text-blue-950 hover:text-green-700"
          >
            Ver todas <ArrowRight size={21} aria-hidden="true" />
          </Link>
        </div>
        {isDemoMode() && (
          <p className="mt-4 text-xs text-slate-500">
            Vista de ejemplo. Los productos y precios del mes se publican desde
            el panel de administración.
          </p>
        )}
        {promotions.products.length ? (
          <OffersRail count={promotions.products.length + 1}>
            <article className="flex min-h-[470px] flex-col justify-between rounded-sm bg-green-700 p-6 text-white sm:p-8">
              <BadgePercent size={38} strokeWidth={1.5} aria-hidden="true" />
              <div className="py-10">
                <h3 className="max-w-sm text-3xl font-bold leading-tight">
                  Descubre las ofertas que tenemos para ti.
                </h3>
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-green-50">
                  Una nueva selección cada mes. Conoce las condiciones de cada
                  producto en tu sucursal Farmacova.
                </p>
              </div>
              <Link
                href="/promociones"
                className="block rounded-sm bg-white px-5 py-3 text-center font-semibold text-blue-950 hover:bg-green-50"
              >
                Ver todas las ofertas
              </Link>
            </article>
            {promotions.products.map((product) => (
              <PromotionCard key={product.slug} product={product} />
            ))}
          </OffersRail>
        ) : (
          <p className="mt-7 rounded-2xl bg-slate-50 p-8 text-slate-600">
            Estamos preparando las próximas promociones. Vuelve pronto para
            conocer los productos del mes.
          </p>
        )}
      </section>
      <div className="bg-green-100 py-4">
        <div className="shell flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <p className="flex items-center gap-4 font-medium text-blue-950">
            <MapPin
              className="shrink-0 text-green-700"
              size={28}
              aria-hidden="true"
            />
            Tu bienestar, cerca de ti. Encuentra tu sucursal Farmacova.
          </p>
          <Link
            href="/sucursales"
            className="shrink-0 rounded-sm border border-blue-900 bg-white px-8 py-3 text-center font-semibold text-blue-950 hover:bg-blue-50"
          >
            Ver sucursales
          </Link>
        </div>
      </div>
      <div className="shell py-12">
        <Services />
      </div>
      <section className="bg-blue-100 py-6">
        <div className="shell flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-blue-950">
              <CreditCard className="shrink-0" size={28} aria-hidden="true" />
              Completa 6 sellos. Recibe un 15% de descuento.
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Cada ₡10.000 en compras en la farmacia te da un sello. Únete al
              Club Farmacova y lleva tu tarjeta contigo.
            </p>
          </div>
          <Link
            href="/fidelidad"
            className="shrink-0 rounded-sm bg-blue-900 px-8 py-3 text-center font-semibold text-white hover:bg-blue-800"
          >
            Conocer mi tarjeta
          </Link>
        </div>
      </section>
      <SponsoredModal ad={ad} />
    </>
  );
}
