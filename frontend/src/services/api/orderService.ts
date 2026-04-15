import { api } from './client';

export type ShippingPayload = {
  first_name: string;
  last_name: string;
  address_line1: string;
  city: string;
  postal_code: string;
  country?: string;
};

export type CouponPreview = {
  coupon_code: string;
  subtotal: number;
  shipping_cost: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
};

export type OrderDto = {
  id: string;
  date: string;
  status: string;
  total: number;
  items: { name: string; product_slug: string; product_id: string; quantity: number; price: number; image: string }[];
};

function num(v: unknown): number {
  if (typeof v === 'string') return parseFloat(v);
  return Number(v);
}

function normalizeOrder(raw: Record<string, unknown>): OrderDto {
  const items = (raw.items as Record<string, unknown>[]) || [];
  return {
    id: String(raw.id),
    date: String(raw.date),
    status: String(raw.status),
    total: num(raw.total),
    items: items.map((i) => ({
      name: String(i.name),
      product_slug: String(i.product_slug ?? ''),
      product_id: String(i.product_id ?? ''),
      quantity: Number(i.quantity),
      price: num(i.price),
      image: String(i.image ?? ''),
    })),
  };
}

export const orderService = {
  async checkout(shipping: ShippingPayload, couponCode?: string): Promise<OrderDto> {
    const { data } = await api.post<Record<string, unknown>>('/orders/checkout/', {
      shipping,
      payment_method: 'cod',
      coupon_code: couponCode || '',
    });
    return normalizeOrder(data);
  },

  async couponPreview(couponCode?: string, shipping?: ShippingPayload): Promise<CouponPreview> {
    const { data } = await api.post<Record<string, unknown>>('/orders/coupon-preview/', {
      coupon_code: couponCode || '',
      shipping: shipping || {},
    });
    return {
      coupon_code: String(data.coupon_code || ''),
      subtotal: num(data.subtotal),
      shipping_cost: num(data.shipping_cost),
      tax_amount: num(data.tax_amount),
      discount_amount: num(data.discount_amount),
      total: num(data.total),
    };
  },

  async list(): Promise<OrderDto[]> {
    const { data } = await api.get<Record<string, unknown>[] | { results?: Record<string, unknown>[] }>('/orders/');
    const rows = Array.isArray(data) ? data : data.results || [];
    return rows.map((r) => normalizeOrder(r));
  },
};
