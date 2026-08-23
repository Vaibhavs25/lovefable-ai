import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, ShieldCheck, Crown, AlertCircle } from 'lucide-react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'Free' | 'Pro';
  generationsToday: number;
  onSelectTier: (tier: 'Free' | 'Pro') => void;
  onOpenCheckout?: () => void;
  limitReachedAlert?: boolean;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currentTier,
  generationsToday,
  onSelectTier,
  onOpenCheckout,
  limitReachedAlert = false,
}) => {
  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

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
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        >
          {/* Top Banner Header */}
          <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer" aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-amber-300 fill-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">LoveFable Membership Tiers</span>
            </div>
            <h3 className="text-2xl font-bold font-quicksand">Choose Your Video Creation Plan</h3>
            <p className="text-xs text-pink-100 mt-1">
              Currently on <span className="font-bold underline">{currentTier} Tier</span> ({generationsToday}/3 videos generated today)
            </p>
          </div>

          <div className="p-6 space-y-5">
            {limitReachedAlert && (
              <div className="p-3.5 rounded-2xl bg-amber-50 text-amber-900 text-xs font-bold border border-amber-200 flex items-start gap-2.5 animate-bounce">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-amber-900">Daily Limit Reached (3/3 Videos)!</div>
                  <div className="font-normal text-amber-800 mt-0.5">
                    Free users are limited to 3 video generations per day. Upgrade to Pro for unlimited creations without limits or watermarks!
                  </div>
                </div>
              </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Plan */}
              <div
                className={`p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                  currentTier === 'Free'
                    ? 'border-pink-300 bg-rose-50/50 ring-2 ring-pink-200'
                    : 'border-slate-200 bg-white hover:border-pink-200'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-slate-800">Free Starter</span>
                    {currentTier === 'Free' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-slate-900 my-1">
                    $0 <span className="text-xs font-normal text-slate-500">/ forever</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-2 my-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>3 Video Generations</strong> / day</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Gemini AI Narration & Music</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-400">
                      <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span>LoveFable Watermark included</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTier('Free');
                    onClose();
                  }}
                  disabled={currentTier === 'Free'}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  {currentTier === 'Free' ? 'Current Tier' : 'Switch to Free'}
                </button>
              </div>

              {/* Pro Plan */}
              <div
                className={`p-5 rounded-2xl border transition-all text-left relative flex flex-col justify-between ${
                  currentTier === 'Pro'
                    ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-300'
                    : 'border-pink-500 bg-gradient-to-b from-pink-50/40 to-purple-50/40 hover:border-pink-600'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold text-purple-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Pro Creator
                    </span>
                    {currentTier === 'Pro' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-rose-400 text-slate-900">
                        Recommended
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 my-1">
                    $6 <span className="text-xs font-normal text-slate-500">/ month</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-2 my-4">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>Unlimited Video Generations</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>HD Quality Video</strong> Export</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span><strong>No Watermark</strong> on video player</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Priority Gemini AI speed</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (currentTier === 'Pro') return;
                    onClose();
                    if (onOpenCheckout) {
                      onOpenCheckout();
                    } else {
                      onSelectTier('Pro');
                    }
                  }}
                  disabled={currentTier === 'Pro'}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-60 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {currentTier === 'Pro' ? 'Pro Plan Active' : 'Upgrade to Pro ($6/mo)'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Instant unlock • Cancel anytime
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 underline text-[11px] cursor-pointer"
              >
                Close Window
              </button>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
