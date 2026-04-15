import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';

export const Cart = () => {
  const { cart, removeFromCart, updateQuantity } = useStore();
  const navigate = useNavigate();

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 25;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 flex flex-col items-center justify-center text-center">
        <div className="w-32 h-32 bg-slate-50 dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-10 shadow-inner">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-700" />
        </div>
        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">Your cart is empty</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-12 text-lg font-medium">
          Looks like you haven't added anything to your cart yet. Explore our latest gadgets and find something you love!
        </p>
        <Link to="/products" className="btn-primary px-12 py-5">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center gap-6 mb-16">
        <button onClick={() => navigate(-1)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-5xl font-extrabold tracking-tight">Shopping Cart</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-8">
          {cart.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-100 dark:border-slate-800"
            >
              <div className="w-32 h-40 shrink-0 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </div>
              
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 block">{item.brand}</span>
                    <h3 className="text-2xl font-bold tracking-tight hover:text-brand-600 transition-colors cursor-pointer">{item.name}</h3>
                  </div>
                  <button 
                    type="button"
                    onClick={() => void removeFromCart(item.id)}
                    className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between mt-8">
                  <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-sm">
                    <button 
                      type="button"
                      onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-base">{item.quantity}</span>
                    <button 
                      type="button"
                      onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-2xl font-extrabold tracking-tight">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Order Summary</h2>
            
            <div className="space-y-6 mb-12">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Subtotal</span>
                <span className="font-extrabold text-lg">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Shipping</span>
                <span className="font-extrabold text-lg text-emerald-500">
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] text-[10px]">Estimated Tax</span>
                <span className="font-extrabold text-lg">{formatPrice(tax)}</span>
              </div>
              <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-6" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                <span className="text-4xl font-extrabold tracking-tight text-brand-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full btn-primary py-5 text-base flex items-center justify-center gap-4"
            >
              Checkout <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mt-10 leading-relaxed">
              Shipping and taxes calculated at checkout. <br /> Free shipping on orders over $500.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
