export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  /** Extra gallery URLs from API (optional). */
  images?: string[];
  slug?: string;
  rating: number;
  reviewsCount: number;
  stock: number;
  brand: string;
  specs: Record<string, string>;
  isFeatured?: boolean;
  discount?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  preferences?: Record<string, unknown>;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
}
