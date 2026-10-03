import { crc } from "@/lib/loyalty";
import type { Product } from "@/lib/catalog";
export async function ProductPrice({ product }: { product: Product }) {
  // Componente exclusivo del servidor: las ofertas se evalúan por solicitud.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now();
  const onSale =
    product.sale_price_crc != null &&
    product.price_crc != null &&
    product.promotion_starts_at &&
    product.promotion_ends_at &&
    Date.parse(product.promotion_starts_at) <= now &&
    Date.parse(product.promotion_ends_at) > now;
  return (
    <div className="mt-4">
      {product.price_crc != null ? (
        <>
          <p className="text-xl font-bold text-blue-900">
            {crc(Number(onSale ? product.sale_price_crc : product.price_crc))}
          </p>
          {onSale && (
            <p className="mt-1 text-xs text-slate-500">
              <span className="line-through">
                {crc(Number(product.price_crc))}
              </span>{" "}
              · Oferta hasta{" "}
              {new Date(product.promotion_ends_at!).toLocaleDateString(
                "es-CR",
                { timeZone: "America/Costa_Rica" },
              )}
            </p>
          )}
        </>
      ) : null}
      {product.availability && product.availability !== "confirmar" && (
        <p
          className={`mt-2 text-xs font-semibold ${product.availability === "agotado" ? "text-slate-500" : "text-green-700"}`}
        >
          {product.availability === "agotado"
            ? "Agotado · Confirma reposición en sucursal"
            : "Disponible · Confirma existencias en sucursal"}
        </p>
      )}
    </div>
  );
}
