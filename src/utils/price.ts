
export function getDiscountedPrice(price: number, discount: number, isPercent: boolean = true): number {
  if (!discount) return price;
  if (isPercent) {
    return Math.round(price * (1 - discount / 100));
  }
  return Math.max(0, price - discount);
}


// Format price in Vietnamese currency
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
};