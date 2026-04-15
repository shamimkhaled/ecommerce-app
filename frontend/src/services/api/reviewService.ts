import { api } from './client';
import { Review } from '../../types';

function mapRow(raw: Record<string, unknown>): Review {
  return {
    id: String(raw.id),
    userId: String(raw.userId),
    userName: String(raw.userName),
    rating: Number(raw.rating),
    comment: String(raw.comment),
    date: String(raw.date),
  };
}

export const reviewService = {
  async list(lookup: string): Promise<Review[]> {
    const { data } = await api.get<Record<string, unknown>[]>(`/products/${encodeURIComponent(lookup)}/reviews/`);
    return data.map(mapRow);
  },
  async create(lookup: string, rating: number, comment: string): Promise<void> {
    await api.post(`/products/${encodeURIComponent(lookup)}/reviews/`, { rating, comment });
  },
  async eligibility(lookup: string): Promise<{ can_review: boolean; delivered: boolean; already_reviewed: boolean }> {
    const { data } = await api.get<{ can_review: boolean; delivered: boolean; already_reviewed: boolean }>(
      `/products/${encodeURIComponent(lookup)}/reviews/eligibility/`
    );
    return data;
  },
};

