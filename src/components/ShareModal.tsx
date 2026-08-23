import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, Check, QrCode, Share2, Send, Sparkles, Heart } from 'lucide-react';
import { Storyboard } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyboard: Storyboard | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  storyboard,
}) => {
  const [copied, setCopied] = useState(false);

  // Escape key to close
  useEffect(() => {
    if (!isOpen || !storyboard) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, storyboard]);

  const shareUrl = `${window.location.origin}/#fable-${storyboard?.id || ''}`;

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && storyboard && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-purple-600 p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer" aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <Share2 className="w-4 h-4 text-pink-200" />
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">Share LoveFable</span>
            </div>
            <h3 className="text-xl font-bold font-quicksand truncate">{storyboard.title}</h3>
            <p className="text-xs text-pink-100 mt-1 line-clamp-1">{storyboard.subtitle}</p>
          </div>

          <div className="p-6 space-y-5 text-center">
            {/* Real QR Code Container */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 inline-block shadow-inner mx-auto relative group">
              <div className="w-40 h-40 bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(shareUrl)}&color=1e293b&bgcolor=ffffff&margin=4`}
                  alt={`QR code linking to ${storyboard?.title || 'this fable'}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />

                {/* Heart Badge Overlay in Center */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="p-1.5 rounded-full bg-pink-500 text-white shadow-md border-2 border-white">
                    <Heart className="w-4 h-4 fill-white" />
                  </div>
                </div>
              </div>

              <div className="text-[11px] font-semibold text-slate-500 mt-2.5 flex items-center justify-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-pink-500" />
                <span>Scan to watch story on mobile</span>
              </div>
            </div>

            {/* Copy Link Input & Button */}
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Direct Fable Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600 outline-none select-all truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-pink-500 hover:bg-pink-600 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-400 mb-2.5">Or share directly via</div>
              <div className="grid grid-cols-3 gap-2">
                <a
                  href={`sms:?&body=${encodeURIComponent(`Check out my LoveFable story "${storyboard?.title || ''}"! ${shareUrl}`)}`}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-pink-50 text-slate-700 hover:text-pink-600 font-semibold text-xs border border-slate-200/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer no-underline"
                >
                  <Send className="w-3.5 h-3.5 text-pink-500" />
                  <span>iMessage</span>
                </a>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out my LoveFable story "${storyboard?.title || ''}"! ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 font-semibold text-xs border border-slate-200/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer no-underline"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: storyboard?.title || 'LoveFable Story',
                        text: `Check out my LoveFable story "${storyboard?.title || ''}"!`,
                        url: shareUrl,
                      }).catch(() => {});
                    } else {
                      handleCopyLink();
                    }
                  }}
                  className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-600 font-semibold text-xs border border-slate-200/80 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-purple-500" />
                  <span>More</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
