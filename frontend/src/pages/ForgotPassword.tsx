import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api/authService';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      toast.success('If this email exists, reset link has been sent.');
    } catch {
      toast.error('Could not send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-16 max-w-xl">
      <h1 className="text-3xl font-bold mb-4">Forgot Password</h1>
      <p className="text-slate-500 mb-8">Enter your account email to receive a password reset link.</p>
      <form onSubmit={submit} className="space-y-4">
        <input className="input-modern" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send Reset Link'}</button>
      </form>
      <Link to="/login" className="inline-block mt-6 text-sm text-brand-600 hover:underline">Back to login</Link>
    </div>
  );
};

