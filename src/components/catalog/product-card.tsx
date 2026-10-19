import Link from "next/link";
import Image from "next/image";
import { Info, MapPin, Store } from "lucide-react";
import { categories, localImagePath, type Product } from "@/lib/catalog";
import { isActivePromotion, savingPercent } from "@/lib/promotions";
import { ProductPrice } from "./product-price";
import { ProductQuickView } from "./product-quick-view";
import { PrescriptionBadge } from "./prescription-badge";
import { CategoryIcon } from "../ui/category-icon";

function ProductImage({ product, sizes }: { product: Product; sizes: string }) {
  const image = localImagePath(product.image_path);
  const category = categories.find(
    (item) => item.slug === product.category_slug,
  );
  return image ? (
    <Image
      src={image}
      alt={product.name}
      fill
      sizes={sizes}
      className="object-contain"
      unoptimized={!image.startsWith("/images/")}
    />
  ) : (
    <div className="flex h-full items-center justify-center text-blue-800">
      <CategoryIcon
        name={category?.icon ?? "pill"}
        size={56}
        strokeWidth={1.2}
      />
    </div>
  );
}

// Una sola etiqueta discreta: el ahorro si hay precio de oferta; si no, el
// nombre de la campaña.
function badgeText(product: Product) {
  const saving = savingPercent(product);
  if (saving > 0) return `Oferta −${saving}%`;
  return isActivePromotion(product) ? product.promotion_label : null;
}

export function ProductCard({ product }: { product: Product }) {
  const badge = badgeText(product);
  const href = `/catalogo/${product.slug}`;
  return (
    <ProductQuickView
      href={href}
      name={product.name}
      card={
        <>
          <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-50">
            <ProductImage
              product={product}
              sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 320px"
            />
            {badge && (
              <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-green-800 shadow-sm ring-1 ring-green-100">
                {badge}
              </span>
            )}
            {product.requires_prescription && (
              <PrescriptionBadge className="absolute right-2.5 top-2.5" />
            )}
          </div>
          <div className="px-1 pb-4 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {product.brand}
            </p>
            <h3 className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-blue-950">
              {product.name}
            </h3>
          </div>
        </>
      }
    >
      <ProductDetails product={product} href={href} />
    </ProductQuickView>
  );
}

// Contenido del panel lateral: aquí vive la información extensa.
async function ProductDetails({
  product,
  href,
}: {
  product: Product;
  href: string;
}) {
  const category = categories.find(
    (item) => item.slug === product.category_slug,
  );
  const ends =
    isActivePromotion(product) && product.promotion_ends_at
      ? new Date(Date.parse(product.promotion_ends_at) - 1).toLocaleDateString(
          "es-CR",
          {
            timeZone: "America/Costa_Rica",
            day: "numeric",
            month: "long",
          },
        )
      : null;
  return (
    <div className="space-y-6 p-5 sm:p-6">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-50">
        <ProductImage
          product={product}
          sizes="(max-width: 640px) 100vw, 448px"
        />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-green-700">
          {product.brand}
          {category ? ` · ${category.name}` : ""}
        </p>
        <h2 className="mt-1.5 text-2xl font-bold tracking-tight text-blue-950">
          {product.name}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {badgeText(product) && (
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-800">
              {badgeText(product)}
            </span>
          )}
          {product.requires_prescription && <PrescriptionBadge withLabel />}
        </div>
        <ProductPrice product={product} showAvailability={false} />
      </div>
      <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-100 text-sm">
        <div className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
          <dt className="text-slate-500">Presentación</dt>
          <dd className="text-slate-900">{product.presentation}</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
          <dt className="text-slate-500">Laboratorio</dt>
          <dd className="text-slate-900">{product.brand}</dd>
        </div>
        <div className="grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3">
          <dt className="text-slate-500">Disponibilidad</dt>
          <dd className="flex items-start gap-1.5 text-slate-900">
            <Store
              size={16}
              className="mt-0.5 shrink-0 text-green-700"
              aria-hidden="true"
            />
            {product.availability === "disponible"
              ? "Disponible · confirma existencias en sucursal"
              : product.availability === "agotado"
                ? "Agotado · consulta la reposición en sucursal"
                : "Se confirma en sucursal"}
          </dd>
        </div>
      </dl>
      {product.description && (
        <p className="text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>
      )}
      <p className="flex gap-2.5 rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-500">
        <Info size={16} className="mt-px shrink-0" aria-hidden="true" />
        <span>
          {ends ? `Promoción vigente hasta el ${ends}. ` : ""}
          Precios, presentaciones y existencias se confirman en sucursal.
          {product.requires_prescription
            ? " La dispensación requiere receta médica y la confirma el equipo farmacéutico."
            : ""}
        </span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={`/sucursales?producto=${encodeURIComponent(product.name)}`}
          className="btn-primary flex-1"
        >
          <MapPin size={17} aria-hidden="true" /> Consultar en sucursal
        </Link>
        <Link href={href} className="btn-secondary flex-1">
          Ver ficha completa
        </Link>
      </div>
    </div>
  );
}
