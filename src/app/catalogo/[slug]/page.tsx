import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  categories,
  getProduct,
  isDemoMode,
  localImagePath,
} from "@/lib/catalog";
import { CategoryIcon } from "@/components/ui/category-icon";
import { ProductPrice } from "@/components/catalog/product-price";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.name ?? "Producto" };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const category = categories.find(
    (item) => item.slug === product.category_slug,
  );
  return (
    <div className="shell py-12">
      <Link
        href="/promociones"
        className="text-sm font-semibold text-blue-800 underline underline-offset-4"
      >
        Volver a las promociones
      </Link>
      <div className="mt-8 grid gap-10 md:grid-cols-2">
        <div className="flex min-h-72 items-center justify-center rounded-3xl bg-slate-50 text-blue-800">
          {localImagePath(product.image_path) ? (
            <Image
              src={localImagePath(product.image_path)!}
              alt={`Campaña de ${product.name}`}
              width={554}
              height={554}
              className="h-auto w-full rounded-3xl"
              unoptimized
            />
          ) : (
            <CategoryIcon
              name={category?.icon ?? "pill"}
              size={110}
              strokeWidth={1}
            />
          )}
        </div>
        <div>
          <span className="eyebrow">{category?.name ?? product.brand}</span>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-blue-950">
            {product.name}
          </h1>
          <p className="mt-4 text-slate-500">{product.presentation}</p>
          <ProductPrice product={product} />
          <p className="mt-6 leading-relaxed text-slate-600">
            {product.description}
          </p>
          {product.requires_prescription && (
            <p className="mt-4 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              Requiere receta médica. La dispensación se confirma con el equipo
              farmacéutico.
            </p>
          )}
          <Link
            href={`/sucursales?producto=${encodeURIComponent(product.name)}`}
            className="btn-primary mt-8"
          >
            Consultar disponibilidad en sucursal
          </Link>
          {isDemoMode() && (
            <p className="mt-6 text-xs leading-relaxed text-slate-500">
              Ficha de ejemplo. No representa disponibilidad, indicaciones ni
              presentaciones verificadas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
