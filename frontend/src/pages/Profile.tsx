import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, ShoppingBag, Heart, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import { orderService } from '../services/api/orderService';
import { userService } from '../services/api/userService';

export const Profile = () => {
  const { user, logout, updateProfile } = useStore();
  const navigate = useNavigate();
  const [ordersCount, setOrdersCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const preview = useMemo(() => (avatarFile ? URL.createObjectURL(avatarFile) : user?.avatar), [avatarFile, user?.avatar]);

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  useEffect(() => {
    setName(user.name || '');
    setPhone(user.phone || '');
    setAddress(user.address || '');
  }, [user]);

  useEffect(() => {
    void (async () => {
      try {
        const [orders, wishlist, notifs] = await Promise.all([
          orderService.list(),
          userService.listWishlist(),
          userService.listNotifications(),
        ]);
        setOrdersCount(orders.length);
        setWishlistCount(wishlist.length);
        setNotificationsCount(notifs.filter((n: any) => !n.is_read).length);
      } catch {
        setOrdersCount(0);
      }
    })();
  }, []);

  const saveProfile = async () => {
    const form = new FormData();
    form.append('name', name);
    form.append('phone', phone);
    form.append('address', address);
    if (avatarFile) form.append('avatar', avatarFile);
    await updateProfile(form);
  };

  const menuItems = [
    { icon: ShoppingBag, label: 'My Orders', desc: 'View and track your orders', link: '/orders' },
    { icon: Heart, label: 'Wishlist', desc: 'Your saved gadgets', link: '/wishlist' },
    { icon: Bell, label: 'Notifications', desc: 'Manage your alerts', link: '/notifications' },
    { icon: Shield, label: 'Security', desc: 'Password and 2FA', link: '/security' },
    { icon: Settings, label: 'Settings', desc: 'Account preferences', link: '/settings' },
  ];

  return (
    <div className="container-custom py-12">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-10 mb-16 p-12 bg-brand-600 text-white rounded-[3rem] overflow-hidden relative shadow-2xl shadow-brand-600/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]" />
          
          <div className="relative">
            <img src={preview} alt={user.name} className="w-44 h-44 rounded-[2.5rem] border-4 border-white/20 shadow-2xl object-cover" />
            <label className="absolute -bottom-2 -right-2 p-3.5 bg-white text-brand-600 rounded-2xl shadow-xl hover:scale-110 transition-transform active:scale-95 cursor-pointer">
              <Settings className="w-5 h-5" />
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          
          <div className="flex-1 text-center md:text-left relative">
            <h1 className="text-5xl font-extrabold mb-3 tracking-tight">{user.name}</h1>
            <p className="text-brand-100 mb-10 text-xs font-bold uppercase tracking-[0.2em]">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-10">
              <div>
                <p className="text-[10px] text-brand-200 uppercase font-bold tracking-[0.2em] mb-2">Total Orders</p>
                <p className="text-3xl font-extrabold tracking-tight">{ordersCount}</p>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block" />
              <div>
                <p className="text-[10px] text-brand-200 uppercase font-bold tracking-[0.2em] mb-2">Wishlist</p>
                <p className="text-3xl font-extrabold tracking-tight">{wishlistCount}</p>
              </div>
              <div className="w-px h-12 bg-white/10 hidden sm:block" />
              <div>
                <p className="text-[10px] text-brand-200 uppercase font-bold tracking-[0.2em] mb-2">Reward Points</p>
                <p className="text-3xl font-extrabold tracking-tight">{notificationsCount}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 mb-8 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
          <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-modern" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
            <input className="input-modern" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
            <textarea className="input-modern md:col-span-2" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" />
          </div>
          <button className="btn-primary mt-4" onClick={() => void saveProfile()}>Save Profile</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {menuItems.map((item, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate(item.link)}
              className="flex items-center gap-8 p-10 bg-white dark:bg-slate-900/50 rounded-[2rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all text-left group border border-slate-100 dark:border-slate-800/50 shadow-sm hover:shadow-xl hover:shadow-brand-500/5 hover:border-brand-500/20"
            >
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center group-hover:bg-brand-600 group-hover:text-white transition-all shadow-inner">
                <item.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-xs uppercase tracking-[0.2em] mb-2">{item.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-600 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
          
          <button
            onClick={logout}
            className="flex items-center gap-8 p-10 bg-red-500/5 dark:bg-red-500/5 rounded-[2rem] hover:bg-red-500/10 transition-all text-left group md:col-span-2 border border-red-500/10 hover:border-red-500/20"
          >
            <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/20">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-xs uppercase tracking-[0.2em] mb-2 text-red-600">Logout</h3>
              <p className="text-sm text-red-500/70 font-medium">Sign out of your account securely</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
