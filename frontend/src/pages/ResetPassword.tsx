import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authService } from '../services/api/authService';

export const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const uid = params.get('uid') || '';
  const token = params.get('token') || '';

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uid || !token) {
      toast.error('Invalid reset link');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(uid, token, password);
      toast.success('Password reset successful');
      navigate('/login');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-16 max-w-xl">
      <h1 className="text-3xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="input-modern" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Set New Password'}</button>
      </form>
    </div>
  );
};

