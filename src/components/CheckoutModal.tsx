import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, CheckCircle2, Loader2, Shield } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onPaymentSuccess,
}) => {
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Escape key to close (only when not processing)
  useEffect(() => {
    if (!isOpen || status === 'processing') return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('processing');

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const session = await response.json();
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const result = await (stripe as unknown as { redirectToCheckout: (opts: { sessionId: string }) => Promise<{ error?: { message: string } }> }).redirectToCheckout({
        sessionId: session.id,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }
    } catch (err: unknown) {
      console.error(err);
      setError((err as Error).message || 'An unexpected error occurred.');
      setStatus('idle');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget && status !== 'processing') onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 via-pink-600 to-rose-500 p-6 text-white relative">
            {status !== 'processing' && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer" aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center gap-2 mb-1">
              <Lock className="w-4 h-4 text-pink-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Secure Checkout</span>
            </div>
            <h3 className="text-2xl font-bold font-quicksand">Upgrade to LoveFable Pro</h3>
            <p className="text-xs text-pink-100 mt-1">
              Unlock HD exports, unlimited daily generations & watermark removal
            </p>
          </div>

          <div className="p-6">
            {status === 'processing' && (
              <div className="py-12 text-center space-y-4">
                <Loader2 className="w-12 h-12 text-pink-500 animate-spin mx-auto" />
                <h4 className="text-lg font-bold text-slate-800">Processing Your Upgrade...</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Connecting to secure payment gateway. Unlocking Pro features for your account.
                </p>
              </div>
            )}

            {status === 'success' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-10 text-center space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-bold text-slate-900">Payment Successful!</h4>
                <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full inline-block border border-emerald-200">
                  🎉 Pro Tier Activated • Watermark Removed
                </p>
              </motion.div>
            )}

            {status === 'idle' && (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Removed Demo Disclaimer Badge */}

                {/* Order Summary Box */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-slate-800 font-bold">
                    <span>LoveFable Pro Plan (Monthly)</span>
                    <span className="text-purple-600 text-sm">$6.00 / mo</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500">
                    <span>Unlimited HD Videos & Watermark-Free</span>
                    <span>Included</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-500 border-b border-slate-200 pb-2">
                    <span>Estimated Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-900 font-extrabold text-sm pt-1">
                    <span>Total Due Now</span>
                    <span className="text-pink-600">$6.00</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                    {error}
                  </div>
                )}

                {/* Standard Stripe Checkout Redirect */}

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Pay $6.00 & Upgrade Now</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center pt-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secured by Stripe</span>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
