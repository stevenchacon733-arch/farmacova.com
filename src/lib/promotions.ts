type PromotionWindow = {
  promotional: boolean;
  promotion_starts_at?: string | null;
  promotion_ends_at?: string | null;
};

// Sin fechas, la campaña continúa hasta que el administrador la desactive.
export function isActivePromotion(product: PromotionWindow, now = Date.now()) {
  return (
    product.promotional &&
    (!product.promotion_starts_at ||
      Date.parse(product.promotion_starts_at) <= now) &&
    (!product.promotion_ends_at || Date.parse(product.promotion_ends_at) > now)
  );
}

// Porcentaje de ahorro redondeado hacia abajo; 0 si no hay oferta vigente.
export function savingPercent(
  product: PromotionWindow & {
    price_crc?: number | null;
    sale_price_crc?: number | null;
  },
  now = Date.now(),
) {
  const { price_crc: price, sale_price_crc: sale } = product;
  if (!isActivePromotion(product, now) || price == null || sale == null)
    return 0;
  return sale < price ? Math.floor((1 - sale / price) * 100) : 0;
}
