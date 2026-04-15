import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';

export const SettingsPage = () => {
  const { user, updateProfile } = useStore();
  const [newsletter, setNewsletter] = useState(Boolean(user?.preferences?.newsletter));

  const save = async () => {
    await updateProfile({ preferences: { ...(user?.preferences || {}), newsletter } });
  };

  return (
    <div className="container-custom py-12 max-w-xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <label className="flex items-center gap-3 mb-6">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        <span>Receive promotional emails</span>
      </label>
      <button className="btn-primary" onClick={() => void save()}>Save Settings</button>
    </div>
  );
};

