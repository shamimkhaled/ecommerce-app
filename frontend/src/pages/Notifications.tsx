import React, { useEffect, useState } from 'react';
import { userService } from '../services/api/userService';

type Notification = {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  order_number?: string;
};

export const Notifications = () => {
  const [rows, setRows] = useState<Notification[]>([]);

  useEffect(() => {
    void (async () => {
      const data = await userService.listNotifications();
      setRows(data as Notification[]);
    })();
  }, []);

  const markAll = async () => {
    await userService.markNotificationsRead();
    setRows((prev) => prev.map((r) => ({ ...r, is_read: true })));
  };

  return (
    <div className="container-custom py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <button className="btn-secondary" onClick={() => void markAll()}>Mark all read</button>
      </div>
      <div className="space-y-4">
        {rows.map((n) => (
          <div key={n.id} className={`p-4 rounded-xl border ${n.is_read ? 'border-slate-200' : 'border-brand-400 bg-brand-50/40 dark:bg-brand-900/10'}`}>
            <p className="font-bold">{n.title}</p>
            <p className="text-sm text-slate-500">{n.message}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(n.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

