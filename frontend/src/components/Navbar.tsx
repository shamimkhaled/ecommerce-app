import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Menu, X, Sun, Moon, LogOut, Scale } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { productService } from '../services/api/productService';
import { Product } from '../types';
import { SiteSettings } from '../services/api/siteService';

export const Navbar: React.FC<{ site: SiteSettings | null }> = ({ site }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [currency, setCurrency] = useState<'USD' | 'BDT'>(
    ((localStorage.getItem('currency') as 'USD' | 'BDT' | null) || 'USD')
  );
  const { cart, compare, user, theme, toggleTheme, logout } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const t = window.setTimeout(() => {
      void (async () => {
        try {
          const list = await productService.getAll({ search: q, page_size: 5 });
          setSuggestions(list.slice(0, 5));
        } catch {
          setSuggestions([]);
        }
      })();
    }, 250);
    return () => window.clearTimeout(t);
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const onCurrencyChange = (value: 'USD' | 'BDT') => {
    localStorage.setItem('currency', value);
    setCurrency(value);
    window.dispatchEvent(new Event('currency-changed'));
  };

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/50">
      {site?.header_text && (
        <div className="w-full text-center text-xs py-1.5 bg-brand-600 text-white">{site.header_text}</div>
      )}
      <div className="container-custom">
        <div className="flex items-center justify-between h-20 gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            {site?.logo_url ? (
              <img src={site.logo_url} alt={site.site_name} className="w-9 h-9 rounded-lg object-cover" />
            ) : (
              <div className="w-9 h-9 bg-brand-600 rounded-lg flex items-center justify-center group-hover:rotate-6 transition-transform shadow-lg shadow-brand-600/20">
                <div className="w-4 h-4 rounded-sm border-2 border-white flex items-center justify-center">
                  <div className="w-1 h-1 bg-white rounded-full" />
                </div>
              </div>
            )}
            <span className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {(site?.site_name || 'ELECTROHUB').toUpperCase()}
            </span>
          </Link>

          {/* Nav Links - Desktop */}
          <div className="hidden lg:flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
            <Link to="/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Home</Link>
            <Link to="/products" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Shop</Link>
            <Link to="/wishlist" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Wishlist</Link>
            <Link to="/orders" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Orders</Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-md relative">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full bg-slate-100/50 dark:bg-slate-900/50 border border-transparent focus:border-brand-500/30 rounded-xl px-11 py-2.5 focus:ring-4 focus:ring-brand-500/5 outline-none transition-all text-xs font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </form>

            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <>
                  <div className="fixed inset-0 z-[-1]" onClick={() => setShowSuggestions(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded shadow-2xl overflow-hidden py-2"
                  >
                    {suggestions.map(p => (
                      <Link
                        key={p.id}
                        to={`/product/${p.id}`}
                        onClick={() => {
                          setShowSuggestions(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded" />
                        <div>
                          <p className="text-xs font-bold">{p.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest">{p.brand}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-6">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as 'USD' | 'BDT')}
              className="hidden md:block text-xs bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1"
            >
              <option value="USD">USD</option>
              <option value="BDT">BDT</option>
            </select>
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors"
            >
              {theme === 'light' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link to="/cart" className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors relative">
              <ShoppingCart className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg shadow-brand-600/20">
                  {cart.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>
            <Link to={`/compare?ids=${compare.map((p) => p.id).join(',')}`} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors relative">
              <Scale className="w-5 h-5" />
              {compare.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                  {compare.length}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative group">
                <button className="flex items-center gap-3 p-1 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 object-cover" />
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 glass-panel rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all py-3 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50 mb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Account</p>
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{user.name}</p>
                  </div>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 transition-colors text-xs font-semibold">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/orders" className="flex items-center gap-3 px-4 py-2.5 hover:bg-brand-50 dark:hover:bg-brand-900/10 hover:text-brand-600 transition-colors text-xs font-semibold">
                    <ShoppingCart className="w-4 h-4" /> Orders
                  </Link>
                  <div className="h-px bg-slate-200/50 dark:bg-slate-800/50 my-2" />
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors text-xs font-semibold"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20">
                Login
              </Link>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 rounded transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden"
          >
            <div className="container-custom py-4 flex flex-col gap-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search gadgets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-full py-2 pl-10 pr-4 outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              </form>
              <div className="flex flex-col gap-2">
                <Link to="/products" className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">All Products</Link>
                <Link to="/products?category=Laptops" className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Categories</Link>
                <Link to="/products?sort=price-low" className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Deals</Link>
                {!user && (
                  <Link to="/login" className="px-4 py-2 bg-brand-600 text-white rounded-lg text-center font-medium">Login</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
