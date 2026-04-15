import { CartItem, Product } from '../../types';

export function normalizeProduct(raw: Record<string, unknown>): Product {
  const price = typeof raw.price === 'string' ? parseFloat(raw.price) : Number(raw.price);
  const images = Array.isArray(raw.images) ? (raw.images as unknown[]).map(String) : undefined;
  return {
    id: String(raw.id),
    name: String(raw.name),
    description: String(raw.description ?? ''),
    price: Number.isFinite(price) ? price : 0,
    category: String(raw.category ?? ''),
    image: String(raw.image ?? ''),
    images,
    slug: raw.slug != null ? String(raw.slug) : undefined,
    rating: Number(raw.rating ?? 0),
    reviewsCount: Number(raw.reviewsCount ?? 0),
    stock: Number(raw.stock ?? 0),
    brand: String(raw.brand ?? ''),
    specs: (raw.specs as Record<string, string>) || {},
    isFeatured: Boolean(raw.isFeatured),
    discount: raw.discount != null ? Number(raw.discount) : undefined,
  };
}

export function normalizeCartItems(rows: unknown[]): CartItem[] {
  return rows.map((row) => {
    const r = row as Record<string, unknown>;
    const q = Number(r.quantity ?? 1);
    const base = normalizeProduct(r);
    return { ...base, quantity: q };
  });
}
