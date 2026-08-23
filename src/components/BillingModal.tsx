import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CreditCard, Check, Sparkles, ShieldCheck } from 'lucide-react';
import { User } from '../types';

interface BillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdateUser: (updated: User) => void;
}

export const BillingModal: React.FC<BillingModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
}) => {
  const [upgradeNotice, setUpgradeNotice] = useState<string | null>(null);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleUpgrade = (planName: 'Pro' | 'VIP') => {
    // Set credits to the plan amount (not additive) to prevent infinite stacking
    const planCredits = planName === 'VIP' ? 100 : 30;
    onUpdateUser({
      ...user,
      plan: planName,
      credits: planCredits,
    });
    setUpgradeNotice(`Upgraded to ${planName} Plan! You now have ${planCredits} video credits.`);
    setTimeout(() => setUpgradeNotice(null), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer" aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-5 h-5 text-pink-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Billing & Subscriptions</span>
            </div>
            <h3 className="text-2xl font-bold font-quicksand">Manage Your LoveFable Plan</h3>
            <p className="text-xs text-pink-100 mt-1">
              Current Plan: <span className="font-bold underline">{user.plan} Tier</span> • {user.credits} Video Credits Available
            </p>
          </div>

          <div className="p-6 space-y-5">
            {upgradeNotice && (
              <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 flex items-center gap-2 animate-bounce">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{upgradeNotice}</span>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Pro Plan */}
              <div
                className={`p-4 rounded-2xl border transition-all text-left relative ${
                  user.plan === 'Pro'
                    ? 'border-pink-500 bg-pink-50/60 ring-2 ring-pink-300'
                    : 'border-slate-200 bg-white hover:border-pink-300'
                }`}
              >
                {user.plan === 'Pro' && (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-500 text-white">
                    Current Plan
                  </span>
                )}
                <div className="text-sm font-bold text-slate-800">Pro Creator</div>
                <div className="text-2xl font-bold text-pink-600 my-1">
                  $6 <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 my-3">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Unlimited Video Generations</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>HD Export & No Watermark</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Gemini AI Narration & Music</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => handleUpgrade('Pro')}
                  disabled={user.plan === 'Pro'}
                  className="w-full py-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {user.plan === 'Pro' ? 'Active Plan' : 'Select Pro Plan'}
                </button>
              </div>

              {/* VIP Unlimited Plan */}
              <div
                className={`p-4 rounded-2xl border transition-all text-left relative ${
                  user.plan === 'VIP'
                    ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-300'
                    : 'border-slate-200 bg-white hover:border-purple-300'
                }`}
              >
                {user.plan === 'VIP' ? (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                    Current Plan
                  </span>
                ) : (
                  <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Best Value
                  </span>
                )}
                <div className="text-sm font-bold text-slate-800">VIP Unlimited</div>
                <div className="text-2xl font-bold text-purple-600 my-1">
                  $29 <span className="text-xs font-normal text-slate-500">/ month</span>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 my-3">
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Unlimited Video Fables</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Priority Gemini AI speed</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Custom Voice & BGM upload</span>
                  </li>
                </ul>

                <button
                  type="button"
                  onClick={() => handleUpgrade('VIP')}
                  disabled={user.plan === 'VIP'}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-xs transition-all cursor-pointer"
                >
                  {user.plan === 'VIP' ? 'Active Plan' : 'Upgrade to VIP'}
                </button>
              </div>
            </div>

            {/* Mock Payment Method */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-slate-400" />
                <span>•••• •••• •••• 4242 (Visa)</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Secured
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
