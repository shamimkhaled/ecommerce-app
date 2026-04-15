import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Product, CartItem, User } from '../types';
import toast from 'react-hot-toast';
import { authService } from '../services/api/authService';
import {
  addCartItem,
  clearCartApi,
  fetchCart,
  mergeGuestCart,
  removeCartItem,
  setCartQuantity,
} from '../services/api/cartApi';
import { userService } from '../services/api/userService';

interface StoreContextType {
  cart: CartItem[];
  wishlist: Product[];
  compare: Product[];
  user: User | null;
  theme: 'light' | 'dark';
  cartLoaded: boolean;
  refreshCart: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  toggleCompare: (product: Product) => void;
  isInCompare: (productId: string) => boolean;
  login: (email: string, password: string, successMessage?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  updateProfile: (payload: FormData | Record<string, unknown>) => Promise<void>;
  logout: () => void;
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartLoaded, setCartLoaded] = useState(false);

  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [compare, setCompare] = useState<Product[]>(() => {
    const raw = localStorage.getItem('compare');
    return raw ? JSON.parse(raw) : [];
  });

  const [user, setUser] = useState<User | null>(null);
  const [userHydrated, setUserHydrated] = useState(false);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [currencyVersion, setCurrencyVersion] = useState(0);

  const refreshCart = useCallback(async () => {
    try {
      const items = await fetchCart();
      setCart(items);
    } catch {
      setCart([]);
    } finally {
      setCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const u = await authService.me();
      if (!cancelled) {
        setUser(u);
        setUserHydrated(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshUser = useCallback(async () => {
    const u = await authService.me();
    setUser(u);
  }, []);

  useEffect(() => {
    if (!userHydrated) return;
    refreshCart();
  }, [userHydrated, user?.id, refreshCart]);

  useEffect(() => {
    if (!userHydrated) return;
    if (!user) {
      setWishlist([]);
      return;
    }
    void (async () => {
      try {
        setWishlist(await userService.listWishlist());
      } catch {
        setWishlist([]);
      }
    })();
  }, [userHydrated, user]);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('compare', JSON.stringify(compare));
  }, [compare]);

  useEffect(() => {
    const onCurrencyChanged = () => setCurrencyVersion((v) => v + 1);
    window.addEventListener('currency-changed', onCurrencyChanged);
    return () => window.removeEventListener('currency-changed', onCurrencyChanged);
  }, []);

  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const items = await addCartItem(product.id, quantity);
      setCart(items);
      toast.success('Added to cart');
    } catch {
      toast.error('Could not add to cart');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const items = await removeCartItem(productId);
      setCart(items);
      toast.error('Removed from cart');
    } catch {
      toast.error('Could not update cart');
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const items = await setCartQuantity(productId, quantity);
      setCart(items);
    } catch {
      toast.error('Could not update cart');
    }
  };

  const clearCart = async () => {
    try {
      await clearCartApi();
      setCart([]);
    } catch {
      setCart([]);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!user) {
      toast.error('Please login first');
      return;
    }
    try {
      const before = wishlist.some((i) => i.id === product.id);
      const rows = await userService.toggleWishlist(product.id);
      setWishlist(rows);
      toast.success(before ? 'Removed from wishlist' : 'Added to wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const isInWishlist = (productId: string) => wishlist.some((item) => item.id === productId);
  const isInCompare = (productId: string) => compare.some((item) => item.id === productId);

  const toggleCompare = (product: Product) => {
    setCompare((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        toast.error('Removed from compare');
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 4) {
        toast.error('You can compare up to 4 products');
        return prev;
      }
      toast.success('Added to compare');
      return [...prev, product];
    });
  };

  const login = async (email: string, password: string, successMessage = 'Logged in successfully') => {
    const guestToken = localStorage.getItem('cart_token');
    const u = await authService.login(email, password);
    setUser(u);
    if (guestToken) {
      try {
        const items = await mergeGuestCart(guestToken);
        setCart(items);
      } catch {
        await refreshCart();
      }
      localStorage.removeItem('cart_token');
    } else {
      await refreshCart();
    }
    toast.success(successMessage);
  };

  const register = async (name: string, email: string, password: string) => {
    await authService.register(name, email, password);
    await login(email, password, 'Account created');
  };

  const updateProfile = async (payload: FormData | Record<string, unknown>) => {
    const u = await authService.updateProfile(payload);
    setUser(u);
    toast.success('Profile updated');
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    void refreshCart();
    toast.success('Logged out');
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };
  void currencyVersion;

  return (
    <StoreContext.Provider
      value={{
        cart,
        wishlist,
        compare,
        user,
        theme,
        cartLoaded,
        refreshCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleWishlist,
        isInWishlist,
        toggleCompare,
        isInCompare,
        login,
        register,
        refreshUser,
        updateProfile,
        logout,
        toggleTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
