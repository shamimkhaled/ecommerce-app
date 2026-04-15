import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ChevronLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

export const Wishlist = () => {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="container-custom py-20 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] flex items-center justify-center mb-10 shadow-inner border border-slate-100 dark:border-slate-800">
          <Heart className="w-12 h-12 text-slate-300" />
        </div>
        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Your wishlist is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-12 text-lg font-medium">
          Save your favorite gadgets here to keep track of them and buy them later.
        </p>
        <Link to="/products" className="btn-primary px-12 py-5 text-base">
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center gap-6 mb-16">
        <Link to="/" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-5xl font-extrabold tracking-tight">My Wishlist</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {wishlist.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
