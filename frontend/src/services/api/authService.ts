import { User } from '../../types';
import { api } from './client';

type LoginResponse = {
  access: string;
  refresh: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
    avatar?: string;
    phone?: string;
    address?: string;
    preferences?: Record<string, unknown>;
  };
};

function mapUser(u: LoginResponse['user']): User {
  return {
    id: String(u.id),
    name: u.name,
    email: u.email,
    role: u.role,
    avatar:
      u.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.email)}`,
    phone: u.phone,
    address: u.address,
    preferences: u.preferences,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<User> {
    const { data } = await api.post<LoginResponse>('/auth/login/', { email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return mapUser(data.user);
  },

  async register(name: string, email: string, password: string): Promise<User> {
    const { data } = await api.post<LoginResponse['user']>('/auth/register/', {
      name,
      email,
      password,
    });
    return mapUser(data);
  },

  async me(): Promise<User | null> {
    if (!localStorage.getItem('access_token')) return null;
    try {
      const { data } = await api.get<LoginResponse['user']>('/auth/me/');
      return mapUser(data);
    } catch {
      return null;
    }
  },

  async updateProfile(payload: FormData | Record<string, unknown>): Promise<User> {
    const isForm = payload instanceof FormData;
    const { data } = await api.patch<LoginResponse['user']>('/auth/me/', payload, {
      headers: isForm ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });
    return mapUser(data);
  },

  async changePassword(current_password: string, new_password: string): Promise<void> {
    await api.post('/auth/change-password/', { current_password, new_password });
  },

  async forgotPassword(email: string): Promise<void> {
    await api.post('/auth/forgot-password/', {
      email,
      frontend_base_url: `${window.location.origin}/reset-password`,
    });
  },

  async resetPassword(uid: string, token: string, new_password: string): Promise<void> {
    await api.post('/auth/reset-password/', { uid, token, new_password });
  },

  async googleLogin(id_token: string): Promise<User> {
    const { data } = await api.post<LoginResponse>('/auth/google/', { id_token });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return mapUser(data.user);
  },

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('cart_token');
  },
};
