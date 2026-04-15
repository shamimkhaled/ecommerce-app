import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ShieldCheck, ChevronLeft, CheckCircle2, Banknote } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatPrice } from '../utils';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';
import { orderService } from '../services/api/orderService';

export const Checkout = () => {
  const { cart, clearCart, user } = useStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('US');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingPreview, setShippingPreview] = useState<number | null>(null);
  const [taxPreview, setTaxPreview] = useState<number | null>(null);
  const [totalPreview, setTotalPreview] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCost = subtotal > 500 ? 0 : 25;
  const taxAmount = subtotal * 0.08;
  const total = Math.max(0, totalPreview ?? subtotal + shippingCost + taxAmount - discountAmount);

  const shippingPayload = {
    first_name: firstName.trim() || 'N/A',
    last_name: lastName.trim() || 'N/A',
    address_line1: address.trim() || 'N/A',
    city: city.trim() || 'Unknown',
    postal_code: postalCode.trim() || '0000',
    country: country.trim() || 'US',
  };

  const applyCoupon = async () => {
    try {
      const preview = await orderService.couponPreview(couponCode.trim(), shippingPayload);
      setAppliedCoupon(preview.coupon_code);
      setDiscountAmount(preview.discount_amount);
      setShippingPreview(preview.shipping_cost);
      setTaxPreview(preview.tax_amount);
      setTotalPreview(preview.total);
      toast.success(preview.coupon_code ? 'Coupon applied' : 'Coupon removed');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      setAppliedCoupon('');
      setDiscountAmount(0);
      setShippingPreview(null);
      setTaxPreview(null);
      setTotalPreview(null);
      toast.error(err.response?.data?.detail || 'Invalid coupon');
    }
  };

  useEffect(() => {
    if (!city.trim() && !country.trim()) return;
    void (async () => {
      try {
        const preview = await orderService.couponPreview(appliedCoupon || couponCode.trim(), shippingPayload);
        setShippingPreview(preview.shipping_cost);
        setTaxPreview(preview.tax_amount);
        setTotalPreview(preview.total);
        setDiscountAmount(preview.discount_amount);
      } catch {
        setShippingPreview(null);
        setTaxPreview(null);
        setTotalPreview(null);
      }
    })();
  }, [city, country, cart.length]);

  const handlePlaceOrder = async () => {
    if (!firstName.trim() || !lastName.trim() || !address.trim() || !city.trim() || !postalCode.trim()) {
      toast.error('Please complete shipping information');
      return;
    }
    setIsProcessing(true);
    try {
      await orderService.checkout({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        address_line1: address.trim(),
        city: city.trim(),
        postal_code: postalCode.trim(),
        country: country.trim() || 'US',
      }, appliedCoupon || couponCode.trim());
      await clearCart();
      setIsSuccess(true);
      toast.success('Order placed successfully!');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } };
      toast.error(err.response?.data?.detail || 'Could not place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) {
    return null;
  }

  if (isSuccess) {
    return (
      <div className="container-custom py-20 flex flex-col items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-32 h-32 bg-emerald-50 dark:bg-emerald-900/10 rounded-full flex items-center justify-center mb-10 shadow-inner"
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500" />
        </motion.div>
        <h2 className="text-5xl font-extrabold mb-4 tracking-tight">Thank you for your order!</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-12 text-lg font-medium">
          Your order has been placed successfully. We&apos;ll send you an email confirmation with tracking details
          shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <button type="button" onClick={() => navigate('/orders')} className="btn-secondary px-10 py-4">
            View Orders
          </button>
          <button type="button" onClick={() => navigate('/')} className="btn-primary px-10 py-4">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <button type="button" onClick={() => navigate('/products')} className="btn-primary">
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex items-center gap-6 mb-16">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-5xl font-extrabold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-12">
          <section className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Truck className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Shipping Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Address
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="123 Tech St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">City</label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Postal Code
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="94103"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                  Country
                </label>
                <input
                  type="text"
                  className="input-modern"
                  placeholder="US"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center shadow-inner">
                <Banknote className="w-6 h-6 text-brand-600" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight">Payment Method</h2>
            </div>

            <div className="p-8 border-2 border-brand-600 rounded-[2rem] flex items-center gap-6 bg-brand-500/5 shadow-lg shadow-brand-600/5">
              <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                <Banknote className="w-7 h-7 text-brand-600" />
              </div>
              <div>
                <p className="font-extrabold text-base">Cash on Delivery</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.15em] mt-1.5">
                  Pay when your order arrives
                </p>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 p-12 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/50 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-10">Order Summary</h2>

            <div className="space-y-6 mb-12 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-5">
                  <div className="w-14 h-18 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shrink-0 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-sm truncate mb-1.5">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <span className="font-extrabold text-sm">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-10" />

            <div className="space-y-6 mb-12">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-modern"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <button type="button" className="btn-secondary whitespace-nowrap" onClick={() => void applyCoupon()}>
                    Apply
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Subtotal</span>
                <span className="font-extrabold text-lg">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Shipping</span>
                <span className="font-extrabold text-lg text-emerald-500">
                  {(shippingPreview ?? shippingCost) === 0 ? 'FREE' : formatPrice(shippingPreview ?? shippingCost)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Tax</span>
                <span className="font-extrabold text-lg">{formatPrice(taxPreview ?? taxAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                    Discount {appliedCoupon ? `(${appliedCoupon})` : ''}
                  </span>
                  <span className="font-extrabold text-lg text-emerald-600">- {formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="h-px bg-slate-200 dark:bg-slate-800/50 my-6" />
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-900 dark:text-white text-lg">Total</span>
                <span className="text-4xl font-extrabold tracking-tight text-brand-600">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={isProcessing}
              className="w-full btn-primary py-5 text-base flex items-center justify-center gap-4"
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Place Order
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
