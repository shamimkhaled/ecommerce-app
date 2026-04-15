import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import { siteService, SiteSettings } from '../services/api/siteService';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [site, setSite] = useState<SiteSettings | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const s = await siteService.getSettings();
        setSite(s);
      } catch {
        setSite(null);
      }
    })();
  }, []);

  useEffect(() => {
    if (!site) return;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', site.primary_color);
    root.style.setProperty('--color-secondary', site.secondary_color);
    root.style.setProperty('--color-button', site.button_color);
    root.style.setProperty('--color-link', site.link_color);
    root.style.setProperty('--color-bg', site.background_color);
    root.style.setProperty('--color-footer', site.footer_color);
    if (site.seo_title) document.title = site.seo_title;
    const ensureMeta = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.name = name;
        document.head.appendChild(el);
      }
      el.content = content;
    };
    if (site.seo_description) ensureMeta('description', site.seo_description);
    if (site.seo_keywords) ensureMeta('keywords', site.seo_keywords);
    localStorage.setItem('usd_to_bdt_rate', String(site.usd_to_bdt_rate || 120));
    if (!localStorage.getItem('currency')) {
      localStorage.setItem('currency', site.default_currency || 'USD');
    }
  }, [site]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-50 flex flex-col transition-colors duration-500">
      <Navbar site={site} />
      <main className="flex-1">
        {children}
      </main>
      <Footer site={site} />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-slate-900 dark:text-slate-50 dark:border dark:border-slate-800',
          duration: 3000,
        }}
      />
    </div>
  );
};
