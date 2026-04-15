import { CartItem } from '../../types';
import { api } from './client';
import { normalizeCartItems } from './normalize';

export async function fetchCart(): Promise<CartItem[]> {
  const { data } = await api.get<{ items: unknown[] }>('/cart/');
  return normalizeCartItems(data.items || []);
}

export async function addCartItem(productId: string, quantity = 1): Promise<CartItem[]> {
  const { data } = await api.post<{ items: unknown[] }>('/cart/', {
    product_id: Number(productId),
    quantity,
  });
  return normalizeCartItems(data.items || []);
}

export async function setCartQuantity(productId: string, quantity: number): Promise<CartItem[]> {
  const { data } = await api.post<{ items: unknown[] }>('/cart/set-quantity/', {
    product_id: Number(productId),
    quantity,
  });
  return normalizeCartItems(data.items || []);
}

export async function removeCartItem(productId: string): Promise<CartItem[]> {
  const { data } = await api.post<{ items: unknown[] }>('/cart/remove/', {
    product_id: Number(productId),
  });
  return normalizeCartItems(data.items || []);
}

export async function clearCartApi(): Promise<void> {
  await api.delete('/cart/clear/');
}

export async function mergeGuestCart(guestToken: string): Promise<CartItem[]> {
  const { data } = await api.post<{ items: unknown[] }>('/cart/merge/', { guest_token: guestToken });
  return normalizeCartItems(data.items || []);
}
