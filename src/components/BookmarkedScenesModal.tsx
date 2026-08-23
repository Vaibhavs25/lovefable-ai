import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bookmark, Trash2, Quote, Sparkles } from 'lucide-react';
import { BookmarkedScene } from '../types';

interface BookmarkedScenesModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarkedScenes: BookmarkedScene[];
  onRemoveBookmark: (id: string) => void;
}

export const BookmarkedScenesModal: React.FC<BookmarkedScenesModalProps> = ({
  isOpen,
  onClose,
  bookmarkedScenes,
  onRemoveBookmark,
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
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-pink-100 bg-gradient-to-r from-amber-50 to-pink-50">
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-500 fill-amber-400" />
              <h3 className="text-xl font-bold text-slate-800 font-quicksand">
                Bookmarked Favorite Scenes & Quotes ({bookmarkedScenes.length})
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white text-slate-500 transition-all cursor-pointer" aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List Content */}
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            {bookmarkedScenes.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Sparkles className="w-12 h-12 text-amber-300 mx-auto" />
                <p className="text-slate-600 font-semibold text-base">No bookmarked scenes yet.</p>
                <p className="text-slate-400 text-xs">
                  While playing a story, tap "Bookmark Scene" on any scene to save its memorable quote here.
                </p>
              </div>
            ) : (
              bookmarkedScenes.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-2xl border border-pink-100 bg-gradient-to-br from-rose-50/40 via-pink-50/30 to-purple-50/40 space-y-3 relative group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-xs font-bold text-pink-600 uppercase tracking-wider">
                        {item.fableTitle} • Scene {item.scene.id}: {item.scene.sceneTitle}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(item.bookmarkedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveBookmark(item.id)}
                      className="p-1.5 rounded-full hover:bg-rose-100 text-rose-500 transition-all cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-slate-800 text-sm leading-relaxed font-medium">
                    "{item.scene.narrationText}"
                  </p>

                  {item.scene.keyQuote && (
                    <div className="flex items-center gap-2 text-pink-700 font-sacramento text-xl pt-1 border-t border-pink-100">
                      <Quote className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{item.scene.keyQuote}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
