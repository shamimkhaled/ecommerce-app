import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, Headphones, RotateCcw } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../utils';
import { motion } from 'motion/react';
import { productService } from '../services/api/productService';
import { Product } from '../types';
import { siteService, SiteSettings } from '../services/api/siteService';

function StorefrontCta({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const to = (href || '/').trim() || '/';
  if (/^https?:\/\//i.test(to)) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  );
}

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

  const heroBadge = site?.hero_badge_text?.trim() || 'Next Gen Technology';
  const heroTitle = site?.hero_title?.trim() || 'The Future';
  const heroHighlight = site?.hero_title_highlight?.trim() || 'of Innovation.';
  const heroDesc =
    site?.hero_description?.trim() ||
    'Experience the next evolution of gadgets. Precision engineered, beautifully designed, and built for the modern world.';
  const promoTitle = site?.promo_title?.trim() || 'Immersive';
  const promoHighlight = site?.promo_title_highlight?.trim() || 'Sound Experience.';
  const promoDesc =
    site?.promo_description?.trim() ||
    'Get up to 30% off on all Sony and Bose headphones this week. Experience audio like never before.';
  const promoCta = site?.promo_cta_label?.trim() || 'Shop Audio Deals';
  const promoUrl = site?.promo_cta_url?.trim() || '/products?category=Audio';

  return (
    <div className="flex flex-col pb-20">
      {/* Hero Section — content from Site settings */}
      <section className="relative min-h-[min(88vh,52rem)] flex items-center overflow-hidden pt-8 pb-16 md:pt-10 md:pb-20">
        {site?.hero_background_image_url ? (
          <div className="absolute inset-0 z-0">
            <img
              src={site.hero_background_image_url}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/55 to-slate-950/80 dark:from-slate-950/85 dark:via-slate-950/70 dark:to-slate-950/90" />
          </div>
        ) : (
          <div className="absolute inset-0 z-0">
            <div className="absolute top-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-brand-500/10 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] h-[30%] w-[30%] rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>
        )}

        <div className="container-custom relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-3 py-1 dark:border-brand-800/50 dark:bg-brand-900/20 md:mb-8"
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-600 dark:text-brand-400">
                {heroBadge}
              </span>
            </motion.div>

            <h1 className="mb-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
              {heroTitle} <br />
              <span className="bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
                {heroHighlight}
              </span>
            </h1>

            <p className="mb-8 max-w-lg text-base font-medium leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg md:mb-10">
              {heroDesc}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <StorefrontCta
                href={site?.hero_cta_primary_url || '/products'}
                className="group btn-primary inline-flex min-h-[3rem] w-full items-center justify-center gap-3 px-6 py-3.5 text-center sm:w-auto sm:min-w-[12rem]"
              >
                {(site?.hero_cta_primary_label || 'Shop Collection').trim()}
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" />
              </StorefrontCta>
              <StorefrontCta
                href={site?.hero_cta_secondary_url || '/products'}
                className="btn-secondary inline-flex min-h-[3rem] w-full items-center justify-center px-6 py-3.5 text-center sm:w-auto sm:min-w-[12rem]"
              >
                {(site?.hero_cta_secondary_label || 'Explore Categories').trim()}
              </StorefrontCta>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="relative order-2 mt-4 w-full lg:mt-0"
          >
            <div className="relative z-10 overflow-hidden rounded-3xl border border-white/20 shadow-2xl shadow-brand-500/20">
              <img
                src={site?.hero_image_url || 'https://picsum.photos/seed/techhero/1200/1200'}
                alt="Hero"
                className="aspect-[4/3] w-full object-cover sm:aspect-square lg:aspect-auto lg:min-h-[22rem]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -right-4 -top-8 hidden h-28 w-28 items-center justify-center rounded-2xl bg-white shadow-xl dark:bg-slate-900 sm:flex lg:-right-10 lg:-top-10 lg:h-32 lg:w-32">
              <Zap className="h-8 w-8 text-brand-600 lg:h-10 lg:w-10" />
            </div>
            <div className="absolute -bottom-6 -left-2 hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:block lg:-bottom-10 lg:-left-10 lg:p-6">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">Active Users</p>
              <p className="text-2xl font-bold text-brand-600">850+</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50/50 py-16 dark:bg-slate-900/20 md:py-24">
        <div className="container-custom">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
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
                className="group card-modern p-6 md:p-8"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 shadow-sm transition-transform group-hover:scale-110 dark:bg-brand-900/20">
                  <feature.icon className="h-5 w-5 text-brand-600" />
                </div>
                <h3 className="mb-2 text-base font-bold">{feature.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="container-custom py-20 md:py-32">
        <div className="mb-12 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-xl">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl lg:text-5xl">Shop by Category</h2>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400 md:text-lg">
              Find the perfect gadget for your needs with our curated collections.
            </p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-600 transition-all hover:gap-4"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {(categories.length
            ? categories
            : [
                { id: 0, name: 'Laptops', slug: 'laptops', image: 'https://picsum.photos/seed/cat1/800/800' },
                { id: 1, name: 'Smartphones', slug: 'smartphones', image: 'https://picsum.photos/seed/cat2/800/800' },
                { id: 2, name: 'Audio', slug: 'audio', image: 'https://picsum.photos/seed/cat3/800/800' },
                { id: 3, name: 'Wearables', slug: 'wearables', image: 'https://picsum.photos/seed/cat4/800/800' },
                { id: 4, name: 'Gaming', slug: 'gaming', image: 'https://picsum.photos/seed/cat5/800/800' },
                { id: 5, name: 'Accessories', slug: 'accessories', image: 'https://picsum.photos/seed/cat6/800/800' },
              ]
          ).map((cat, i) => (
            <Link
              key={cat.id || i}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className={cn(
                'group relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl dark:bg-slate-900',
                i % 5 === 0 ? 'md:col-span-2' : 'md:col-span-1'
              )}
            >
              <img
                src={cat.image || 'https://picsum.photos/seed/catfallback/800/800'}
                alt={cat.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
              <div className="absolute bottom-6 left-6 text-white md:bottom-10 md:left-10">
                <h3 className="mb-2 text-2xl font-extrabold md:text-3xl">{cat.name}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-80">Shop now</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container-custom py-20 md:py-32">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">Featured Products</h2>
            <p className="font-medium text-slate-500 dark:text-slate-400">Handpicked gadgets for your modern lifestyle.</p>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-600 transition-all hover:gap-4 sm:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {featuredProducts.slice(0, 3).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Promo banner — copy & CTA from Site settings */}
      <section className="container-custom py-12 md:py-20">
        <div className="relative h-[min(36rem,85vh)] min-h-[20rem] overflow-hidden rounded-[2rem] bg-brand-600 shadow-2xl shadow-brand-600/20 md:rounded-[2.5rem] md:h-[600px]">
          <img
            src={site?.homepage_banner_image_url || 'https://picsum.photos/seed/audiobanner/1200/800'}
            alt=""
            className="h-full w-full object-cover opacity-30"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-950/85 via-brand-950/50 to-transparent md:from-brand-950/80 md:via-brand-950/40" />
          <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-24">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="mb-6 max-w-xl text-3xl font-extrabold leading-[1.05] text-white sm:text-4xl md:mb-8 md:text-5xl lg:text-7xl">
                {promoTitle} <br />
                <span className="text-brand-300">{promoHighlight}</span>
              </h2>
              <p className="mb-8 max-w-md text-base font-medium leading-relaxed text-brand-100 md:mb-12 md:text-lg">
                {promoDesc}
              </p>
              <StorefrontCta
                href={promoUrl}
                className="inline-flex min-h-[3rem] items-center gap-4 rounded-2xl bg-white px-8 py-4 text-xs font-bold uppercase tracking-widest text-brand-600 shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {promoCta}
                <ArrowRight className="h-4 w-4" />
              </StorefrontCta>
            </motion.div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container-custom py-20 md:py-32">
        <div className="mb-12 flex flex-col gap-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">New Arrivals</h2>
            <p className="font-medium text-slate-500 dark:text-slate-400">Be the first to own the latest technology.</p>
          </div>
          <Link
            to="/products"
            className="hidden items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-brand-600 transition-all hover:gap-4 sm:flex"
          >
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {latestProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container-custom py-20 md:py-32">
        <div className="relative overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 p-10 text-center dark:border-slate-800 dark:bg-slate-900/40 md:rounded-[3rem] md:p-24">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50" />
          <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white md:mb-8 md:text-4xl lg:text-6xl">
            Join the Hub.
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-base font-medium leading-relaxed text-slate-500 dark:text-slate-400 md:mb-12 md:text-lg">
            Subscribe to our newsletter and get $20 off your first order plus exclusive access to new product launches and
            tech insights.
          </p>
          <form className="mx-auto flex max-w-lg flex-col gap-4 sm:flex-row">
            <input type="email" placeholder="YOUR EMAIL ADDRESS" className="input-modern flex-1" />
            <button type="button" className="btn-primary whitespace-nowrap">
              Subscribe Now
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
