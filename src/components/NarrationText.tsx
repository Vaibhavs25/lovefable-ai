import React, { useMemo } from 'react';
import { motion } from 'motion/react';

interface NarrationTextProps {
  text: string;
  progress: number; // 0 to 1 progress within scene duration
  activeWordIndex?: number;
  onWordClick?: (index: number) => void;
  accentColor?: string;
  keyQuote?: string;
}

export const NarrationText: React.FC<NarrationTextProps> = ({
  text,
  progress,
  activeWordIndex,
  onWordClick,
  accentColor = '#ec4899',
}) => {
  const words = useMemo(() => {
    return text.split(/\s+/).filter(Boolean);
  }, [text]);

  // Calculate visible words based on progress (0 to 1)
  const currentWordIdx = useMemo(() => {
    if (activeWordIndex !== undefined && activeWordIndex >= 0) {
      return activeWordIndex;
    }
    // Progress-based fallback
    return Math.floor(progress * words.length);
  }, [progress, activeWordIndex, words.length]);

  return (
    <div className="relative z-10 w-full max-w-2xl mx-auto text-center px-4 py-6 md:py-8">
      <div className="flex flex-wrap justify-center items-center gap-x-2.5 gap-y-3 leading-relaxed text-lg sm:text-2xl md:text-3xl font-medium tracking-wide drop-shadow-sm">
        {words.map((word, idx) => {
          const isRevealed = idx <= currentWordIdx;
          const isActive = idx === currentWordIdx;

          return (
            <motion.span
              key={`${word}-${idx}`}
              onClick={() => onWordClick?.(idx)}
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{
                opacity: isRevealed ? 1 : 0.15,
                y: isRevealed ? 0 : 4,
                scale: isActive ? 1.08 : 1,
              }}
              transition={{
                duration: 0.35,
                ease: 'easeOut',
              }}
              className={`cursor-pointer transition-colors duration-200 select-none px-1 py-0.5 rounded-lg ${
                isActive
                  ? 'text-pink-600 font-bold bg-pink-100/80 shadow-xs ring-2 ring-pink-300/50 scale-105'
                  : isRevealed
                  ? 'text-slate-800 hover:text-pink-500'
                  : 'text-slate-400 opacity-20'
              }`}
              style={{
                color: isActive ? accentColor : undefined,
              }}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
    </div>
  );
};
