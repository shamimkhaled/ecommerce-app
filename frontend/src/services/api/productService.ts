import { Product } from '../../types';
import { api } from './client';
import { normalizeProduct } from './normalize';

type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function mapResults(data: unknown): Product[] {
  if (Array.isArray(data)) {
    return (data as Record<string, unknown>[]).map((p) => normalizeProduct(p));
  }
  const paginated = data as Paginated<Record<string, unknown>>;
  return (paginated.results || []).map((p) => normalizeProduct(p));
}

export const productService = {
  async getAll(params?: Record<string, string | number | undefined>): Promise<Product[]> {
    const { data } = await api.get('/products/', {
      params: { page_size: 100, ...params },
    });
    return mapResults(data);
  },

  async getById(id: string): Promise<Product | undefined> {
    const { data } = await api.get<Record<string, unknown>>(`/products/${encodeURIComponent(id)}/`);
    return normalizeProduct(data);
  },

  async getFeatured(): Promise<Product[]> {
    const { data } = await api.get<Record<string, unknown>[]>('/products/featured/');
    return Array.isArray(data) ? data.map((p) => normalizeProduct(p)) : [];
  },

  async getByCategory(category: string): Promise<Product[]> {
    if (!category || category === 'All') {
      return productService.getAll();
    }
    return productService.getAll({ category });
  },

  async getCategories(): Promise<{ names: string[]; results: { id: number; name: string; slug: string; image: string }[] }> {
    const { data } = await api.get<{ names: string[]; results: { id: number; name: string; slug: string; image: string }[] }>(
      '/products/categories/'
    );
    return data;
  },

  async getBrandNames(): Promise<string[]> {
    const { data } = await api.get<{ name: string }[] | { results: { name: string }[] }>('/brands/');
    if (Array.isArray(data)) return data.map((b) => b.name);
    return (data.results || []).map((b) => b.name);
  },

  async compare(ids: string[]): Promise<Product[]> {
    if (!ids.length) return [];
    const { data } = await api.get<{ results: Record<string, unknown>[] }>('/products/compare/', {
      params: { ids: ids.join(',') },
    });
    return (data.results || []).map((p) => normalizeProduct(p));
  },
};
