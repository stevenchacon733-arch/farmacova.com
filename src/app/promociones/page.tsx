import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { getCollectionProducts, isDemoMode } from "@/lib/catalog";
import { ProductCard } from "@/components/catalog/product-card";

export const metadata: Metadata = { title: "Promociones" };
export const dynamic = "force-dynamic";

export default async function PromotionsPage() {
  const products = await getCollectionProducts("promociones");
  return (
    <div className="shell py-12">
      <span className="eyebrow">Descubre lo que tenemos para ti</span>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-blue-950">
        Promociones y campañas
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate-600">
        Conoce nuestros productos en promoción. Las condiciones y la
        disponibilidad se confirman en sucursal.
      </p>
      <section className="mt-8 grid items-center gap-8 rounded-3xl bg-slate-50 p-5 md:grid-cols-2 md:p-8">
        <Image
          src="/images/tioflex-raven.png"
          alt="Campaña de Tioflex de Laboratorios Raven: Vuelve a tu ritmo sin dolor."
          width={554}
          height={554}
          className="h-auto w-full rounded-2xl"
          sizes="(max-width: 768px) calc(100vw - 80px), 540px"
          unoptimized
        />
        <div>
          <span className="eyebrow">Laboratorios Raven</span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-blue-950">
            Conoce Tioflex.
          </h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            Descubre la campaña de Raven y encuentra más información del
            producto en nuestro catálogo.
          </p>
          <Link href="/catalogo/tioflex" className="btn-primary mt-7">
            Ver detalles
          </Link>
        </div>
      </section>
      <h2 className="mt-12 text-2xl font-bold text-blue-950">
        Productos en promoción
      </h2>
      {isDemoMode() && (
        <p className="mt-3 text-xs text-slate-500">
          La campaña usa el anuncio proporcionado. Los datos comerciales del
          catálogo son de ejemplo.
        </p>
      )}
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {!products.length && (
        <p className="mt-6 text-slate-500">
          Estamos preparando nuevas promociones. Vuelve pronto.
        </p>
      )}
    </div>
  );
}
