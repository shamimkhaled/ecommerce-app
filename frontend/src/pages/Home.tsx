import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../utils';
import { motion } from 'motion/react';
import { productService } from '../services/api/productService';
import { Product } from '../types';
import { siteService, SiteSettings } from '../services/api/siteService';

export const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [site, setSite] = useState<SiteSettings | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string; slug: string; image: string }[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [feat, all, catRes, siteRes] = await Promise.all([
          productService.getFeatured(),
          productService.getAll({ ordering: '-created_at', page_size: 8 }),
          productService.getCategories(),
          siteService.getSettings(),
        ]);
        if (!cancelled) {
          setFeaturedProducts(feat);
          setLatestProducts(all.slice(0, 4));
          setCategories(catRes.results.slice(0, 6));
          setSite(siteRes);
        }
      } catch {
        if (!cancelled) {
          setFeaturedProducts([]);
          setLatestProducts([]);
          setCategories([]);
          setSite(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col pb-20">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-10">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        <div className="container-custom relative z-10 grid grid-cols-1 lg:grid-cols-2 items-center gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-800/50 mb-8"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">Next Gen Technology</span>
            </motion.div>
            
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8 text-slate-900 dark:text-white">
              The Future <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">of Innovation.</span>
            </h1>
            
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed max-w-md font-medium">
              Experience the next evolution of gadgets. Precision engineered, 
              beautifully designed, and built for the modern world.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Link to="/products" className="btn-primary flex items-center gap-3 group">
                Shop Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/products" className="btn-secondary">
                Explore Categories
              </Link>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl shadow-brand-500/20 border border-white/20">
              <img
                src={site?.hero_image_url || "https://picsum.photos/seed/techhero/1200/1200"}
                alt="Hero Tech" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            {/* Floating elements */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center animate-bounce duration-[3000ms]">
              <Zap className="w-10 h-10 text-brand-600" />
            </div>
            <div className="absolute -bottom-10 -left-10 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Active Users</p>
              <p className="text-2xl font-bold text-brand-600">850+</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over $500' },
              { icon: Shield, title: 'Secure Payment', desc: '100% secure payment' },
              { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
              { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 card-modern"
              >
                <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  <feature.icon className="w-5 h-5 text-brand-600" />
                </div>
                <h3 className="font-bold text-base mb-2">{feature.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container-custom py-32">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Shop by Category</h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Find the perfect gadget for your needs with our curated collections.</p>
          </div>
          <Link to="/products" className="text-[11px] font-bold uppercase tracking-widest flex items-center gap-2 text-brand-600 hover:gap-4 transition-all">
            View All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(categories.length ? categories : [
            { id: 0, name: 'Laptops', slug: 'laptops', image: 'https://picsum.photos/seed/cat1/800/800' },
            { id: 1, name: 'Smartphones', slug: 'smartphones', image: 'https://picsum.photos/seed/cat2/800/800' },
            { id: 2, name: 'Audio', slug: 'audio', image: 'https://picsum.photos/seed/cat3/800/800' },
            { id: 3, name: 'Wearables', slug: 'wearables', image: 'https://picsum.photos/seed/cat4/800/800' },
            { id: 4, name: 'Gaming', slug: 'gaming', image: 'https://picsum.photos/seed/cat5/800/800' },
            { id: 5, name: 'Accessories', slug: 'accessories', image: 'https://picsum.photos/seed/cat6/800/800' },
          ]).map((cat, i) => (
            <Link 
              key={cat.id || i}
              to={`/products?category=${cat.name}`} 
              className={cn(
                "group relative aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 shadow-sm hover:shadow-2xl transition-all duration-500",
                i % 5 === 0 ? "md:col-span-2" : "md:col-span-1"
              )}
            >
              <img src={cat.image || 'https://picsum.photos/seed/catfallback/800/800'} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
              <div className="absolute bottom-10 left-10 text-white">
                <h3 className="text-3xl font-extrabold mb-2">{cat.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Shop now</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-custom py-32">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">Featured Products</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Handpicked gadgets for your modern lifestyle.</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold text-[11px] uppercase tracking-widest hover:gap-4 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {featuredProducts.slice(0, 3).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Banner Section */}
      <section className="container-custom py-20">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-brand-600 h-[600px] shadow-2xl shadow-brand-600/20">
          <img
            src={site?.homepage_banner_image_url || "https://picsum.photos/seed/audiobanner/1200/800"}
            alt="Audio Banner" 
            className="w-full h-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/80 via-brand-950/40 to-transparent" />
          <div className="absolute inset-0 flex flex-col items-start justify-center p-12 md:p-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 max-w-xl leading-[0.95]">
                Immersive <br /> 
                <span className="text-brand-300">Sound Experience.</span>
              </h2>
              <p className="text-lg text-brand-100 mb-12 max-w-md leading-relaxed font-medium">
                Get up to 30% off on all Sony and Bose headphones this week. 
                Experience audio like never before.
              </p>
              <Link to="/products?category=Audio" className="inline-flex items-center gap-4 px-10 py-5 bg-white text-brand-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-xl">
                Shop Audio Deals
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-custom py-32">
        <div className="flex items-end justify-between mb-16">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight mb-4">New Arrivals</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Be the first to own the latest technology.</p>
          </div>
          <Link to="/products" className="hidden sm:flex items-center gap-2 text-brand-600 font-bold text-[11px] uppercase tracking-widest hover:gap-4 transition-all">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {latestProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container-custom py-32">
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] p-12 md:p-24 text-center border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-8 text-slate-900 dark:text-white">Join the Hub.</h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            Subscribe to our newsletter and get $20 off your first order plus 
            exclusive access to new product launches and tech insights.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="YOUR EMAIL ADDRESS" 
              className="flex-1 input-modern"
            />
            <button className="btn-primary whitespace-nowrap">
              Subscribe Now
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
