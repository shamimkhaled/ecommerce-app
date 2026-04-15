import { Product } from '../../types';
import { api } from './client';
import { normalizeProduct } from './normalize';

type WishRow = { product: Record<string, unknown> };
type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  order_number?: string;
};

export const userService = {
  async listWishlist(): Promise<Product[]> {
    const { data } = await api.get<WishRow[]>('/auth/wishlist/');
    return data.map((r) => normalizeProduct(r.product));
  },
  async toggleWishlist(productId: string): Promise<Product[]> {
    const { data } = await api.post<WishRow[]>('/auth/wishlist/toggle/', { product_id: Number(productId) });
    return data.map((r) => normalizeProduct(r.product));
  },
  async listNotifications(): Promise<Notification[]> {
    const { data } = await api.get<Notification[]>('/auth/notifications/');
    return data;
  },
  async markNotificationsRead(id?: string): Promise<void> {
    await api.post('/auth/notifications/mark-read/', id ? { id } : {});
  },
};
