import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { SiteSettings } from '../services/api/siteService';

export const Footer: React.FC<{ site: SiteSettings | null }> = ({ site }) => {
  return (
    <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-24 pb-12" style={{ backgroundColor: site?.footer_color || undefined }}>
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          {/* Brand */}
          <div className="flex flex-col gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-brand-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-5 h-5 rounded-sm border-2 border-white flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full" />
                </div>
              </div>
              <span className="text-2xl font-bold tracking-tighter uppercase">{site?.site_name || 'ElectroHub'}</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed max-w-xs font-medium">
              {site?.footer_text || 'Your one-stop shop for the latest electronics and gadgets. Quality products, competitive prices, and exceptional service.'}
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-bold text-[10px] mb-10 uppercase tracking-[0.2em] text-slate-400">Shop</h4>
            <ul className="flex flex-col gap-5 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/products" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">All Products</Link></li>
              <li><Link to="/products?category=Laptops" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Laptops</Link></li>
              <li><Link to="/products?category=Smartphones" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Smartphones</Link></li>
              <li><Link to="/products?category=Audio" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Audio</Link></li>
              <li><Link to="/products?sort=price-low" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Deals & Offers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-[10px] mb-10 uppercase tracking-[0.2em] text-slate-400">Support</h4>
            <ul className="flex flex-col gap-5 text-[10px] font-bold uppercase tracking-widest">
              <li><Link to="/profile" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Contact Us</Link></li>
              <li><Link to="/orders" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">FAQs</Link></li>
              <li><Link to="/checkout" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Shipping Info</Link></li>
              <li><Link to="/orders" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/orders" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50 transition-colors">Track Order</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-bold text-[10px] mb-10 uppercase tracking-[0.2em] text-slate-400">Newsletter</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs mb-8 leading-relaxed font-medium">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex gap-3">
              <input 
                type="email" 
                placeholder="YOUR EMAIL" 
                className="flex-1 px-5 py-3.5 bg-white dark:bg-slate-900 border-none rounded outline-none text-[10px] font-bold tracking-widest"
              />
              <button className="px-6 py-3.5 bg-brand-600 text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-brand-700 transition-all">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 pt-12 text-center">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2026 ElectroHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
