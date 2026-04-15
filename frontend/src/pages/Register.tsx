import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    try {
      await register(name, email, password);
      navigate('/');
    } catch (e: unknown) {
      const err = e as { response?: { data?: Record<string, unknown> } };
      const d = err.response?.data;
      const msg =
        (typeof d?.detail === 'string' && d.detail) ||
        (Array.isArray(d?.email) && String(d.email[0])) ||
        (Array.isArray(d?.password) && String(d.password[0])) ||
        'Registration failed';
      toast.error(msg);
    }
  };

  return (
    <div className="container-custom py-10 sm:py-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg p-6 sm:p-10 lg:p-16 bg-white dark:bg-slate-900/50 rounded-3xl sm:rounded-[3rem] border border-slate-100 dark:border-slate-800/50 shadow-2xl shadow-brand-500/5"
      >
        <div className="text-center mb-10 sm:mb-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-brand-600 rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 sm:mb-10 shadow-xl shadow-brand-600/20">
            <div className="w-10 h-10 rounded-lg border-4 border-white flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-white rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold mb-4 tracking-tight">Create Account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-[0.2em]">Join ElectroHub and start shopping</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-modern pl-14"
                placeholder="John Doe"
              />
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern pl-14"
                placeholder="name@example.com"
              />
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern pl-14 pr-14"
                placeholder="••••••••"
              />
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-5 text-base flex items-center justify-center gap-4 mt-10">
            Sign Up <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <div className="relative my-10 sm:my-16">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100 dark:border-slate-800/50"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="bg-white dark:bg-slate-900 px-8 text-slate-400">Or sign up with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <button className="flex items-center justify-center gap-4 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-[11px] font-bold uppercase tracking-[0.15em] border border-slate-100 dark:border-slate-800 shadow-sm">
            <Chrome className="w-5 h-5" /> Google
          </button>
          <button className="flex items-center justify-center gap-4 py-5 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all text-[11px] font-bold uppercase tracking-[0.15em] border border-slate-100 dark:border-slate-800 shadow-sm">
            <Github className="w-5 h-5" /> GitHub
          </button>
        </div>

        <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500 mt-10 sm:mt-16">
          Already have an account? <Link to="/login" className="text-brand-600 hover:text-brand-700 hover:underline underline-offset-4">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};
