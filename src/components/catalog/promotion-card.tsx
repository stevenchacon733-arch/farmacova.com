import Link from "next/link";
import Image from "next/image";
import { Pill } from "lucide-react";
import { localImagePath, type Product } from "@/lib/catalog";
import { isActivePromotion } from "@/lib/promotions";
import { ProductPrice } from "./product-price";

export function PromotionCard({ product }: { product: Product }) {
  const image = localImagePath(product.image_path);
  const saving =
    isActivePromotion(product) &&
    product.price_crc != null &&
    product.sale_price_crc != null &&
    product.sale_price_crc < product.price_crc
      ? Math.floor((1 - product.sale_price_crc / product.price_crc) * 100)
      : 0;
  return (
    <article className="flex flex-col overflow-hidden rounded-sm border border-slate-200 bg-white">
      <div className="relative h-[300px] shrink-0 bg-blue-50 sm:h-[340px] lg:h-[360px]">
        {image ? (
          <Image
            src={image}
            alt={`Promoción de ${product.name}`}
            fill
            sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 440px"
            className="object-contain"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Pill
              size={90}
              strokeWidth={1}
              className="text-blue-800"
              aria-hidden="true"
            />
          </div>
        )}
        {saving > 0 && (
          <div className="absolute right-4 top-4 flex h-24 w-24 flex-col items-center justify-center rounded-full bg-green-600 text-white">
            <span className="text-xs font-semibold">Ahorra</span>
            <span className="text-3xl font-bold">{saving}%</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="text-xs font-bold uppercase tracking-wide text-green-700">
          {product.brand}
        </span>
        <h3 className="mt-2 text-xl font-bold leading-tight text-blue-950">
          {product.name}
          {product.promotion_label ? ` · ${product.promotion_label}` : ""}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {product.description || product.presentation}
        </p>
        {product.requires_prescription && (
          <p className="mt-3 text-xs font-semibold text-blue-800">
            Requiere receta médica
          </p>
        )}
        <ProductPrice product={product} />
        <Link href={`/catalogo/${product.slug}`} className="mt-auto block pt-5">
          <span className="block rounded-sm border border-blue-800 px-4 py-3 text-center font-semibold text-blue-900 transition hover:bg-blue-50">
            Ver detalles
          </span>
        </Link>
      </div>
    </article>
  );
}
