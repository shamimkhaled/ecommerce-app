import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { authService } from '../services/api/authService';

export const Security = () => {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.changePassword(current, next);
      setCurrent('');
      setNext('');
      toast.success('Password changed');
    } catch {
      toast.error('Could not change password');
    }
  };

  return (
    <div className="container-custom py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Security</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="input-modern" type="password" placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        <input className="input-modern" type="password" placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} required />
        <button className="btn-primary">Change Password</button>
      </form>
    </div>
  );
};

