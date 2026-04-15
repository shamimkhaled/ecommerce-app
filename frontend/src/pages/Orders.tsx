import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { orderService, OrderDto } from '../services/api/orderService';
import toast from 'react-hot-toast';

export const Orders = () => {
  const { user } = useStore();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const list = await orderService.list();
        if (!cancelled) setOrders(list);
      } catch {
        if (!cancelled) {
          setOrders([]);
          toast.error('Could not load orders');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your orders</h2>
        <Link to="/login" className="btn-primary inline-block">
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-custom py-20 text-center text-slate-500 font-medium">Loading orders…</div>
    );
  }

  return (
    <div className="container-custom py-20">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-6 mb-16">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center shadow-inner">
            <Package className="w-7 h-7 text-brand-600" />
          </div>
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight mb-2">Order History</h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              Track and manage your recent orders
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-center text-slate-500 py-12">No orders yet.</p>
        ) : (
          <div className="space-y-10">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-slate-900/50 rounded-[2.5rem] overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all"
              >
                <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-wrap items-center justify-between gap-8 bg-slate-50/50 dark:bg-slate-800/20">
                  <div className="flex flex-wrap gap-12">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">
                        Order ID
                      </p>
                      <p className="text-sm font-extrabold tracking-tight">{order.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">
                        Date Placed
                      </p>
                      <p className="text-sm font-extrabold tracking-tight">{order.date}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2.5">
                        Total Amount
                      </p>
                      <p className="text-sm font-extrabold tracking-tight text-brand-600">{formatPrice(order.total)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {order.status === 'Delivered' ? (
                      <span className="flex items-center gap-2.5 px-5 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="w-4 h-4" /> Delivered
                      </span>
                    ) : (
                      <span className="flex items-center gap-2.5 px-5 py-2 bg-brand-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-600/20">
                        <Clock className="w-4 h-4" /> {order.status}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-10">
                  <div className="flex flex-col gap-10">
                    {order.items.map((item, idx) => (
                      <div key={`${order.id}-${idx}`} className="flex items-center gap-8">
                        <div className="w-24 h-32 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                          <img
                            src={item.image || 'https://placehold.co/100x100'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-lg mb-2 tracking-tight hover:text-brand-600 transition-colors cursor-pointer">
                            {item.name}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <Link
                            to="/products"
                            className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-all uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-brand-600 pb-1"
                          >
                            Buy Again
                          </Link>
                          {order.status === 'Delivered' && (item.product_slug || item.product_id) && (
                            <Link
                              to={`/product/${encodeURIComponent(item.product_slug || item.product_id)}?review=1`}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-all uppercase tracking-[0.2em] border-b-2 border-transparent hover:border-emerald-600 pb-1"
                            >
                              Review Product
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 pt-10 border-t border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row justify-between items-center gap-8">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      Cash on delivery: payment is collected when your order is delivered.
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
