import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, ChevronDown, Search, X } from 'lucide-react';
import { categories as fallbackCategories } from '../data/mockData';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../utils';
import { motion, AnimatePresence } from 'motion/react';
import { ProductSkeleton } from '../components/ui/Skeleton';
import { productService } from '../services/api/productService';
import { Product } from '../types';

export const ProductListing = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || 'All';
  const sortParam = searchParams.get('sort') || 'featured';

  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState(sortParam);
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>(fallbackCategories);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setSortBy(sortParam);
  }, [sortParam]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [catData, brandNames] = await Promise.all([
          productService.getCategories(),
          productService.getBrandNames(),
        ]);
        if (!cancelled) {
          setCategoryNames(catData.names?.length ? catData.names : fallbackCategories);
          setBrands(brandNames.length ? brandNames : []);
        }
      } catch {
        if (!cancelled) {
          setCategoryNames(fallbackCategories);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    const ordering =
      sortBy === 'price-low'
        ? 'price'
        : sortBy === 'price-high'
          ? '-price'
          : sortBy === 'rating'
            ? 'rating'
            : undefined;
    const category = selectedCategory === 'All' ? undefined : selectedCategory;
    const brandParam = selectedBrands.length ? selectedBrands.join(',') : undefined;

    (async () => {
      try {
        const list = await productService.getAll({
          search: search || undefined,
          category,
          ordering,
          price_min: priceRange[0] > 0 ? priceRange[0] : undefined,
          price_max: priceRange[1],
          brand: brandParam,
          page_size: 100,
        });
        if (!cancelled) setProducts(list);
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, selectedCategory, sortBy, priceRange, selectedBrands]);

  const filteredProducts = products;

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 flex flex-col gap-10">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Categories</h3>
              <div className="flex flex-col gap-1">
                {categoryNames.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === cat 
                        ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Price Range</h3>
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
                <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <span>$0</span>
                  <span className="text-slate-900 dark:text-slate-50">${priceRange[1]}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Brands</h3>
              <div className="flex flex-wrap gap-2">
                {brands.map(brand => (
                  <button 
                    key={brand} 
                    onClick={() => {
                      setSelectedBrands(prev => 
                        prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                      );
                    }}
                    className={cn(
                      "px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                      selectedBrands.includes(brand)
                        ? "bg-brand-600 text-white border-brand-600 shadow-lg shadow-brand-600/20"
                        : "border-slate-200 dark:border-slate-800 hover:border-brand-500/30 dark:hover:border-brand-500/30"
                    )}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-16">
            <div>
              <h1 className="text-5xl font-extrabold tracking-tight mb-3">
                {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                Showing {filteredProducts.length} premium gadgets
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-5 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-sm"
              >
                <Filter className="w-4 h-4" /> Filters
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-3 pr-12 rounded-xl font-bold text-[11px] uppercase tracking-widest outline-none focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Mobile Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="lg:hidden mb-12 p-8 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800 relative"
              >
                <button 
                  onClick={() => setShowFilters(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Categories</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categoryNames.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-left px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                            selectedCategory === cat ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/20' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Price Range</h3>
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-600"
                    />
                    <div className="flex justify-between mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>$0</span>
                      <span className="text-slate-900 dark:text-slate-50">${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold mb-2">No products found</h2>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                We couldn't find any products matching your current filters. Try adjusting your search or category.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setPriceRange([0, 2000]);
                }}
                className="mt-8 btn-primary"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
