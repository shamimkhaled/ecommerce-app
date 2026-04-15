import React from 'react';
import { LayoutDashboard, Package, Users, ShoppingCart, TrendingUp, DollarSign, Plus, Search, MoreVertical } from 'lucide-react';
import { products } from '../data/mockData';
import { formatPrice } from '../utils';

export const AdminDashboard = () => {
  const stats = [
    { label: 'Total Revenue', value: '$124,500', icon: DollarSign, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Total Orders', value: '1,240', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Products', value: '48', icon: Package, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Total Users', value: '850', icon: Users, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="container-custom py-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-10 mb-20">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-3">Admin Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button className="btn-primary px-10 py-4 flex items-center gap-4 text-base">
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        {stats.map((stat, i) => (
          <div key={i} className="p-10 bg-white dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 transition-all">
            <div className="flex items-center justify-between mb-8">
              <div className={`p-5 rounded-2xl shadow-inner ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="flex items-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">
                <TrendingUp className="w-4 h-4" /> +12%
              </span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">{stat.label}</p>
            <h3 className="text-4xl font-extrabold tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent Products Table */}
      <div className="bg-white dark:bg-slate-900/50 rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800/50 shadow-sm">
        <div className="p-10 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-8 bg-slate-50/50 dark:bg-slate-800/20">
          <h2 className="text-2xl font-extrabold tracking-tight">Inventory Management</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="input-modern pl-14 w-full sm:w-80"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.2em] border-b border-slate-100 dark:border-slate-800/50">
                <th className="px-10 py-6">Product</th>
                <th className="px-10 py-6">Category</th>
                <th className="px-10 py-6">Price</th>
                <th className="px-10 py-6">Stock</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-20 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <p className="font-extrabold text-base tracking-tight mb-1.5 group-hover:text-brand-600 transition-colors">{product.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{product.brand}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.15em]">{product.category}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-base font-extrabold text-brand-600">{formatPrice(product.price)}</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{product.stock} units</span>
                  </td>
                  <td className="px-10 py-8">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg ${
                      product.stock > 20 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-orange-500 text-white shadow-orange-500/20'
                    }`}>
                      {product.stock > 20 ? 'In Stock' : 'Low Stock'}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                      <MoreVertical className="w-5 h-5 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-10 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Showing 1 to {products.length} of 48 products</p>
          <div className="flex gap-4">
            <button className="px-8 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all" disabled>Prev</button>
            <button className="px-8 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};
