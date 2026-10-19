import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  categories,
  searchProducts,
  getSponsoredAd,
  isDemoMode,
  type Product,
} from "@/lib/catalog";
import { getCampaigns } from "@/lib/campaigns-server";
import { CampaignCarousel } from "@/components/marketing/campaign-carousel";
import { ProductCard } from "@/components/catalog/product-card";
import { OffersRail } from "@/components/marketing/offers-rail";
import { CategoryTabs } from "@/components/marketing/category-tabs";
import { SponsoredModal } from "@/components/ads/sponsored-modal";
import { Services } from "@/components/marketing/services";
import { BrandsRail } from "@/components/marketing/brands-rail";
import { ClubStamps } from "@/components/loyalty/club-stamps";

export const dynamic = "force-dynamic";

function rail(products: Product[]) {
  return (
    <OffersRail count={products.length}>
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </OffersRail>
  );
}

export default async function HomePage() {
  const [promotions, ad, campaigns] = await Promise.all([
    searchProducts("", "", 1, "promociones"),
    getSponsoredAd(),
    getCampaigns(),
  ]);
  const products = promotions.products;
  // Una pestaña por categoría con promociones; "Todas" siempre va primero.
  const tabs = [
    { id: "todas", label: "Todas", content: rail(products) },
    ...categories
      .map((category) => ({
        id: category.slug,
        label: category.name,
        items: products.filter((p) => p.category_slug === category.slug),
      }))
      .filter((tab) => tab.items.length > 0)
      .map(({ id, label, items }) => ({ id, label, content: rail(items) })),
  ];
  return (
    <>
      <h1 className="sr-only">Farmacova: promociones y productos del mes</h1>
      <CampaignCarousel campaigns={campaigns} demo={isDemoMode()} />
      <div className="space-y-16 py-12 sm:space-y-24 sm:py-16">
        <section
          id="promociones-del-mes"
          className="shell scroll-mt-[max(1rem,env(safe-area-inset-top))]"
          aria-labelledby="promotions-title"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2
                id="promotions-title"
                className="text-2xl font-bold tracking-tight text-blue-950 sm:text-3xl"
              >
                Promociones del mes
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">
                Condiciones y disponibilidad en sucursal.
              </p>
            </div>
            <Link
              href="/promociones"
              className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-blue-800 hover:text-green-700"
            >
              Ver todas <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {products.length ? (
            <CategoryTabs tabs={tabs} />
          ) : (
            <p className="mt-6 rounded-2xl bg-slate-50 p-8 text-slate-600">
              Estamos preparando las próximas promociones. Vuelve pronto para
              conocer los productos del mes.
            </p>
          )}
        </section>
        <div className="shell">
          <ClubStamps />
        </div>
        <div className="shell">
          <Services />
        </div>
        <BrandsRail />
      </div>
      <SponsoredModal ad={ad} demo={isDemoMode()} />
    </>
  );
}
