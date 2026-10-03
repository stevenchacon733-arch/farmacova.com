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
