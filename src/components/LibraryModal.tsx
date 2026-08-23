import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, BookOpen, Trash2, Play, Calendar, Heart } from 'lucide-react';
import { SavedFable, Storyboard } from '../types';

interface LibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedFables: SavedFable[];
  onSelectFable: (storyboard: Storyboard) => void;
  onDeleteFable: (id: string) => void;
  onClearLibrary: () => void;
}

export const LibraryModal: React.FC<LibraryModalProps> = ({
  isOpen,
  onClose,
  savedFables,
  onSelectFable,
  onDeleteFable,
  onClearLibrary,
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
          className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-pink-100 bg-gradient-to-r from-rose-50 to-pink-50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-pink-500" />
              <h3 className="text-xl font-bold text-slate-800 font-quicksand">
                Saved LoveFable Library ({savedFables.length})
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
            {savedFables.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <Heart className="w-12 h-12 text-pink-300 mx-auto fill-pink-100" />
                <p className="text-slate-600 font-semibold text-base">Your library is currently empty.</p>
                <p className="text-slate-400 text-xs">
                  Generate a story and click "Save Story" to bookmark your favorite LoveFables here.
                </p>
              </div>
            ) : (
              savedFables.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-pink-100 hover:border-pink-300 bg-slate-50/50 hover:bg-rose-50/30 transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-800 text-base truncate">{item.storyboard.title}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-bold">
                        {item.storyboard.tone}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{item.storyboard.subtitle}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.savedAt).toLocaleDateString()}
                      </span>
                      <span>• {item.storyboard.scenes.length} Scenes</span>
                      <span>• Theme: {item.storyboard.visualTheme}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        onSelectFable(item.storyboard);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Play</span>
                    </button>

                    <button
                      onClick={() => onDeleteFable(item.id)}
                      className="p-2 rounded-full hover:bg-rose-100 text-rose-500 transition-all cursor-pointer"
                      title="Delete Saved Fable"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {savedFables.length > 0 && (
            <div className="p-4 border-t border-pink-100 bg-slate-50 flex justify-between items-center text-xs">
              <button
                onClick={onClearLibrary}
                className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer"
              >
                Clear All Saved Fables
              </button>
              <span className="text-slate-400">Stored locally in your browser</span>
            </div>
          )}
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
