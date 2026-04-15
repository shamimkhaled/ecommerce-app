import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star, Eye, Plus, Minus, Scale } from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatPrice, cn } from '../utils';
import { motion } from 'motion/react';
import { Modal } from './ui/Modal';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, toggleCompare, isInCompare } = useStore();
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const isWishlisted = isInWishlist(product.id);
  const compared = isInCompare(product.id);

  const handleQuickAddToCart = () => {
    void addToCart(product, quantity);
    setIsQuickViewOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group card-modern overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50 dark:bg-slate-800/50">
        <Link to={`/product/${product.id}`}>
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-4 left-4">
          {product.discount && (
            <span className="bg-brand-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg shadow-brand-600/20">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={() => toggleWishlist(product)}
          className={cn(
            "absolute top-4 right-4 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            isWishlisted ? "text-red-500" : "text-slate-400 hover:text-red-500"
          )}
        >
          <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
        </button>

        <button
          onClick={() => toggleCompare(product)}
          className={cn(
            "absolute top-16 right-4 p-2.5 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            compared ? "text-indigo-600" : "text-slate-400 hover:text-indigo-600"
          )}
        >
          <Scale className={cn("w-4 h-4", compared && "fill-current")} />
        </button>

        {/* Quick View Button */}
        <button
          onClick={() => setIsQuickViewOpen(true)}
          className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-900 dark:text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all hover:bg-brand-600 hover:text-white flex items-center justify-center gap-2"
        >
          <Eye className="w-3.5 h-3.5" /> Quick View
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
            {product.category}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{product.rating}</span>
          </div>
        </div>
        
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-slate-900 dark:text-slate-50 mb-3 line-clamp-1 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-slate-900 dark:text-slate-50">
              {formatPrice(product.price)}
            </span>
            {product.discount && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.price * (1 + product.discount / 100))}
              </span>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => void addToCart(product)}
            className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20 active:scale-90"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick View Modal */}
      <Modal
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
        title="Quick View"
        className="max-w-3xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col justify-center">
            <div className="mb-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.brand}</span>
              <h2 className="text-2xl font-bold tracking-tight mt-1">{product.name}</h2>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
              {product.discount && (
                <span className="text-lg text-slate-300 line-through font-medium">
                  {formatPrice(product.price * (1 + product.discount / 100))}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 line-clamp-3">
              {product.description}
            </p>

            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <button 
                onClick={handleQuickAddToCart}
                className="flex-1 bg-brand-600 text-white py-4 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/20"
              >
                Add to Cart
              </button>
            </div>

            <Link 
              to={`/product/${product.id}`}
              onClick={() => setIsQuickViewOpen(false)}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 transition-colors text-center"
            >
              View Full Details
            </Link>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};
