import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ShoppingCart, Heart, Star, ShieldCheck, Truck, RotateCcw, ChevronRight, Share2, Plus, Minus, ArrowRight, Scale } from 'lucide-react';
import { productService } from '../services/api/productService';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice, cn } from '../utils';
import { ProductCard } from '../components/ProductCard';
import { motion, AnimatePresence } from 'motion/react';
import { Skeleton } from '../components/ui/Skeleton';
import { ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { reviewService } from '../services/api/reviewService';
import { Review } from '../types';

export const ProductDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useStore();
  const [product, setProduct] = useState<Product | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isLoading, setIsLoading] = useState(true);
  const [openAccordion, setOpenAccordion] = useState<string | null>('shipping');
  const [activeImage, setActiveImage] = useState<string | undefined>(undefined);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');
  const [reviewEligibility, setReviewEligibility] = useState<{ can_review: boolean; delivered: boolean; already_reviewed: boolean } | null>(null);
  const [allowImageZoom, setAllowImageZoom] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const apply = () => setAllowImageZoom(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    (async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      try {
        const p = await productService.getById(id);
        if (cancelled) return;
        setProduct(p);
        if (p?.category) {
          const same = await productService.getByCategory(p.category);
          if (!cancelled) {
            setRelatedProducts(same.filter((x) => x.id !== p.id).slice(0, 4));
          }
        } else {
          setRelatedProducts([]);
        }
        if (p) {
          const r = await reviewService.list(p.slug || p.id);
          if (!cancelled) setReviews(r);
          try {
            const el = await reviewService.eligibility(p.slug || p.id);
            if (!cancelled) setReviewEligibility(el);
          } catch {
            if (!cancelled) setReviewEligibility(null);
          }
        }
      } catch {
        if (!cancelled) {
          setProduct(undefined);
          setRelatedProducts([]);
          setReviews([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (product) setActiveImage(product.image);
  }, [product]);

  useEffect(() => {
    if (searchParams.get('review') === '1') {
      setActiveTab('reviews');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams]);

  const galleryImages = product
    ? Array.from(
        new Set(
          [
            product.image,
            ...(product.images || []).filter((u) => u && u !== product.image),
          ].filter(Boolean) as string[]
        )
      )
    : [];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setMousePos({ x, y });
  };

  if (!isLoading && !product) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <Link to="/products" className="btn-primary inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const compared = product ? isInCompare(product.id) : false;

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  };

  const submitReview = async () => {
    if (!product) return;
    try {
      await reviewService.create(product.slug || product.id, myRating, myComment);
      toast.success('Review submitted successfully');
      const r = await reviewService.list(product.slug || product.id);
      setReviews(r);
      const refreshed = await productService.getById(product.slug || product.id);
      if (refreshed) setProduct(refreshed);
      try {
        const el = await reviewService.eligibility(product.slug || product.id);
        setReviewEligibility(el);
      } catch {
        setReviewEligibility(null);
      }
      setMyComment('');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Could not submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-6">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 flex-1" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom px-4 py-6 sm:px-6 sm:py-10 md:py-12">
      {/* Breadcrumbs */}
      <div className="mb-6 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:mb-8">
        <Link to="/" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Home</Link>
        <ChevronRight className="w-3 h-3" />
        <Link to="/products" className="hover:text-slate-900 dark:hover:text-slate-50 transition-colors">Products</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-900 dark:text-slate-50 truncate">{product?.name}</span>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-10 lg:mb-20 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 sm:space-y-6"
        >
          <div
            className={cn(
              'relative aspect-square overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900',
              allowImageZoom && 'cursor-zoom-in'
            )}
            onMouseEnter={() => allowImageZoom && setIsZoomed(true)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={allowImageZoom ? handleMouseMove : undefined}
          >
            <img
              src={activeImage}
              alt={product?.name}
              className={cn(
                'h-full w-full object-cover transition-transform duration-200',
                allowImageZoom && isZoomed ? 'scale-[2.5]' : 'scale-100'
              )}
              style={allowImageZoom && isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
              referrerPolicy="no-referrer"
            />
          </div>
          {galleryImages.length > 1 && (
            <div className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-2">
              {galleryImages.map((img, i) => (
                <button
                  type="button"
                  key={`${img}-${i}`}
                  onClick={() => setActiveImage(img)}
                  className={cn(
                    'h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-slate-50 transition-all touch-manipulation dark:bg-slate-900 sm:h-20 sm:w-20 md:rounded-2xl',
                    activeImage === img
                      ? 'border-brand-600 shadow-lg shadow-brand-600/20'
                      : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  )}
                >
                  <img
                    src={img}
                    alt={`${product?.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product?.brand}</span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => product && void toggleWishlist(product)}
                className={cn(
                  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors touch-manipulation',
                  isWishlisted ? 'text-red-500' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Heart className={cn('h-4 w-4', isWishlisted && 'fill-current')} />
              </button>
              <button
                type="button"
                onClick={() => product && toggleCompare(product)}
                className={cn(
                  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full transition-colors touch-manipulation',
                  compared ? 'text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                )}
              >
                <Scale className={cn('h-4 w-4', compared && 'fill-current')} />
              </button>
            </div>
          </div>

          <h1 className="mb-5 text-3xl font-bold leading-tight tracking-tight sm:mb-6 sm:text-4xl md:text-5xl">{product?.name}</h1>

          <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 sm:mb-8 sm:gap-x-6">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={cn(
                    'h-4 w-4',
                    s <= Math.floor(product?.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-800'
                  )}
                />
              ))}
              <span className="ml-2 text-sm font-bold">{product?.rating}</span>
            </div>
            <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">{product?.reviewsCount} reviews</span>
            <span className="hidden h-4 w-px bg-slate-200 sm:block dark:bg-slate-800" />
            <span
              className={cn(
                'text-xs font-bold uppercase tracking-widest',
                (product?.stock ?? 0) > 0 ? 'text-emerald-500' : 'text-amber-600'
              )}
            >
              {(product?.stock ?? 0) > 0 ? `In stock (${product?.stock})` : 'Out of stock'}
            </span>
          </div>

          <div className="mb-8 flex flex-wrap items-center gap-3 sm:mb-10 sm:gap-4">
            <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">{formatPrice(product?.price || 0)}</span>
            {product?.discount && (
              <div className="flex items-center gap-3">
                <span className="text-xl text-slate-300 dark:text-slate-700 line-through font-medium">
                  {formatPrice((product?.price || 0) * (1 + product.discount / 100))}
                </span>
                <span className="bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-brand-600/20">
                  -{product.discount}%
                </span>
              </div>
            )}
          </div>

          <p className="mb-8 text-base leading-relaxed text-slate-500 dark:text-slate-400 sm:mb-10 sm:text-lg">{product?.description}</p>

          <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-stretch sm:gap-4">
            <div className="flex w-full items-center justify-center rounded-2xl border border-slate-200 p-1 dark:border-slate-800 sm:w-auto sm:justify-start">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 touch-manipulation sm:h-14 sm:w-14"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="min-w-[3rem] text-center text-base font-bold">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                disabled={(product?.stock ?? 0) > 0 && quantity >= (product?.stock ?? 0)}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800 touch-manipulation sm:h-14 sm:w-14"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={() => void handleAddToCart()}
              disabled={(product?.stock ?? 0) < 1}
              className="btn-primary inline-flex min-h-[3.25rem] w-full flex-1 items-center justify-center gap-2 py-4 text-base touch-manipulation disabled:cursor-not-allowed disabled:opacity-50 sm:py-5"
            >
              <ShoppingCart className="h-5 w-5 shrink-0" /> Add to Cart
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 rounded-[2rem] border border-slate-100 bg-slate-50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50 sm:grid-cols-3 sm:gap-8 sm:p-8">
            <div className="flex flex-col gap-3">
              <Truck className="w-6 h-6 text-brand-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">Free Shipping</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">On orders over $500</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <RotateCcw className="w-6 h-6 text-brand-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">30 Days Return</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Easy returns policy</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-1">2 Year Warranty</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Full manufacturer cover</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-slate-100 dark:border-slate-800 sm:mb-12">
        <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-1 sm:gap-8 md:gap-12">
          {['description', 'specs', 'reviews', 'shipping'].map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'relative touch-manipulation whitespace-nowrap pb-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all sm:pb-6',
                activeTab === tab ? 'text-brand-600' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              )}
            >
              {tab}
              {activeTab === tab && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-brand-600 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[280px] sm:min-h-[400px]">
        {activeTab === 'description' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose dark:prose-invert max-w-none"
          >
            <div className="space-y-8">
              <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-6 dark:border-slate-800/50 dark:bg-slate-900/50 sm:rounded-[2.5rem] sm:p-10">
                <h3 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">Product Overview</h3>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg">
                  {product?.description}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-400">Key Features</h4>
                  <ul className="space-y-4">
                    {['Premium build quality', 'Latest technology integration', 'Energy efficient performance', 'Ergonomic design'].map((feature, i) => (
                      <li key={i} className="flex items-center gap-4 text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-brand-600 shadow-lg shadow-brand-600/40" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-6">
                  <h4 className="font-bold uppercase text-[10px] tracking-[0.2em] text-slate-400">What's in the box</h4>
                  <ul className="space-y-4">
                    {[`1x ${product?.name}`, 'Charging Cable', 'User Manual', 'Warranty Card'].map((item, i) => (
                      <li key={i} className="flex items-center gap-4 text-sm font-semibold">
                        <div className="w-2 h-2 rounded-full bg-brand-600 shadow-lg shadow-brand-600/40" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Accordion Details */}
              <div className="space-y-4 pt-8">
                {[
                  { id: 'shipping', title: 'Shipping & Delivery', content: 'We offer free standard shipping on all orders over $500. Standard delivery typically takes 3-5 business days. Express shipping options are available at checkout.' },
                  { id: 'returns', title: 'Returns & Exchanges', content: 'If you are not completely satisfied with your purchase, you can return it within 30 days for a full refund or exchange. Items must be in original condition and packaging.' },
                  { id: 'warranty', title: 'Warranty Information', content: 'This product comes with a 1-year limited manufacturer warranty covering defects in materials and workmanship under normal use.' },
                ].map((item) => (
                  <div key={item.id} className="border-b border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setOpenAccordion(openAccordion === item.id ? null : item.id)}
                      className="flex w-full touch-manipulation items-center justify-between py-5 text-left sm:py-6"
                    >
                      <span className="text-[10px] font-bold uppercase tracking-widest">{item.title}</span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", openAccordion === item.id && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {openAccordion === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="pb-6 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.content}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
        {activeTab === 'specs' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-2"
          >
            {product && Object.entries(product.specs).map(([key, value]) => (
              <div key={key} className="flex justify-between py-6 border-b border-slate-100 dark:border-slate-800/50">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-[0.15em]">{key}</span>
                <span className="text-sm font-extrabold text-brand-600">{value}</span>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Customer Reviews</h3>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('reviews');
                  window.setTimeout(() => document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' }), 100);
                }}
                className="touch-manipulation rounded-xl border-2 border-slate-200 px-6 py-3 text-[11px] font-bold uppercase tracking-widest transition-all hover:border-brand-600 hover:text-brand-600 dark:border-slate-800 sm:px-8"
              >
                Write a Review
              </button>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {reviews.map((r) => (
                <div key={r.id} className="pb-8 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center font-bold text-slate-400">
                        {r.userName?.slice(0, 1) || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">{r.userName}</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={cn("w-3 h-3", s <= r.rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300")} />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{r.date}</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-3xl">
                    {r.comment}
                  </p>
                </div>
              ))}
              <div id="review-form" className="scroll-mt-24 pt-4">
                {reviewEligibility && !reviewEligibility.can_review && (
                  <p className="mb-3 text-sm text-slate-500">
                    {reviewEligibility.already_reviewed
                      ? 'You already reviewed this product.'
                      : 'You can review only after this product is delivered to you.'}
                  </p>
                )}
                <div className="mb-3 flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold">Your rating</span>
                  <select
                    value={myRating}
                    onChange={(e) => setMyRating(Number(e.target.value))}
                    className="input-modern max-w-[120px] py-2 touch-manipulation"
                  >
                    {[5, 4, 3, 2, 1].map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  value={myComment}
                  onChange={(e) => setMyComment(e.target.value)}
                  className="input-modern mb-3 min-h-[100px] w-full"
                  placeholder="Write your review..."
                />
                <button
                  type="button"
                  className="btn-primary touch-manipulation disabled:opacity-50"
                  disabled={!reviewEligibility?.can_review}
                  onClick={() => void submitReview()}
                >
                  Submit Review
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 sm:mt-24 lg:mt-32">
          <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">You May Also Like</h2>
            <Link to="/products" className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
              Explore More <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
