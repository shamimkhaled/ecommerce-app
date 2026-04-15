import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number) {
  const selected = (localStorage.getItem('currency') as 'USD' | 'BDT' | null) || 'USD';
  const rate = Number(localStorage.getItem('usd_to_bdt_rate') || '120');
  const currency = selected === 'BDT' ? 'BDT' : 'USD';
  const amount = currency === 'BDT' ? price * rate : price;
  return new Intl.NumberFormat(currency === 'BDT' ? 'en-BD' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}
