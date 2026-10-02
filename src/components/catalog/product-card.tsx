import Link from "next/link";
import Image from "next/image";
import { categories, localImagePath, type Product } from "@/lib/catalog";
import { CategoryIcon } from "../ui/category-icon";

export function ProductCard({ product }: { product: Product }) {
  const category = categories.find(
    (item) => item.slug === product.category_slug,
  );
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-blue-300 hover:shadow-lg hover:shadow-blue-950/5">
      <div className="relative flex h-48 items-center justify-center bg-slate-50">
        {product.promotional && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
            {product.promotion_label ?? "Promoción"}
          </span>
        )}
        {localImagePath(product.image_path) ? (
          <Image
            src={localImagePath(product.image_path)!}
            alt={`Campaña de ${product.name}`}
            width={192}
            height={192}
            className="h-full w-full object-contain"
            unoptimized
          />
        ) : (
          <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white bg-white text-blue-800 shadow-sm transition group-hover:-translate-y-1">
            <CategoryIcon
              name={category?.icon ?? "pill"}
              size={42}
              strokeWidth={1.3}
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-green-700">
          {product.brand}
        </span>
        <h3 className="mt-2 text-lg font-bold text-blue-950">{product.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-500">
          {product.presentation}
        </p>
        {product.requires_prescription && (
          <span className="mt-3 w-fit rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-800">
            Requiere receta
          </span>
        )}
        <Link
          className="mt-auto block pt-6 text-sm font-semibold text-blue-800 underline decoration-blue-200 underline-offset-4 hover:decoration-blue-800"
          href={`/catalogo/${product.slug}`}
        >
          Ver detalles
        </Link>
      </div>
    </article>
  );
}
