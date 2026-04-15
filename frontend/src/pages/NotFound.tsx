import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound = () => {
  return (
    <div className="container-custom py-20 text-center">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-4">404 Error</p>
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">Page not found</h1>
      <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
        The page you are looking for does not exist or has been moved. Continue browsing from the shop or homepage.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="btn-secondary">Go Home</Link>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    </div>
  );
};
