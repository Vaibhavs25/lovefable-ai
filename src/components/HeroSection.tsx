import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Heart, Sparkles, Wand2, BookOpen, Music, Play } from 'lucide-react';

interface HeroSectionProps {
  onStartClick: () => void;
  onExplorePresets: () => void;
  onOpenLibrary: () => void;
  savedCount: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartClick,
  onExplorePresets,
  onOpenLibrary,
  savedCount,
}) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current) return; // throttle: skip if a frame is already pending
      rafRef.current = requestAnimationFrame(() => {
        const { innerWidth, innerHeight } = window;
        const x = (e.clientX / innerWidth) * 2 - 1;
        const y = (e.clientY / innerHeight) * 2 - 1;
        setMousePos({ x, y });
        rafRef.current = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section className="relative overflow-hidden py-12 md:py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-rose-100/60 via-pink-50/50 to-transparent rounded-3xl mx-2 md:mx-6 my-4 border border-rose-200/50 shadow-xs">
      {/* Interactive Mouse-Tracking Parallax Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Floating Heart 1 */}
        <div
          className="absolute top-12 left-[10%] text-pink-300/60 transition-transform duration-300 ease-out"
          style={{
            transform: `translate(${mousePos.x * -25}px, ${mousePos.y * -25}px)`,
          }}
        >
          <Heart className="w-12 h-12 fill-pink-200 animate-float" />
        </div>

        {/* Floating Heart 2 */}
        <div
          className="absolute top-1/3 right-[12%] text-rose-300/50 transition-transform duration-500 ease-out"
          style={{
            transform: `translate(${mousePos.x * 35}px, ${mousePos.y * 35}px)`,
          }}
        >
          <Heart className="w-16 h-16 fill-rose-200 animate-float" style={{ animationDelay: '1s' }} />
        </div>

        {/* Floating Sparkles */}
        <div
          className="absolute bottom-16 left-[18%] text-purple-300/70 transition-transform duration-200 ease-out"
          style={{
            transform: `translate(${mousePos.x * 20}px, ${mousePos.y * -20}px)`,
          }}
        >
          <Sparkles className="w-10 h-10 animate-pulse-glow" />
        </div>

        {/* Soft Pastel Glow Aura */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-tr from-pink-300/30 to-purple-300/30 rounded-full blur-3xl pointer-events-none transition-transform duration-700 ease-out"
          style={{
            transform: `translate(calc(-50% + ${mousePos.x * 40}px), ${mousePos.y * 40}px)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-6">
        {/* Header Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-pink-200 shadow-xs text-pink-700 font-semibold text-xs sm:text-sm tracking-wide"
        >
          <Sparkles className="w-4 h-4 text-pink-500 animate-spin" style={{ animationDuration: '8s' }} />
          <span>AI-Powered Personal Storyboard & Narration Studio</span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-slate-800 font-quicksand"
        >
          Turn Personal Messages into <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent font-cursive text-5xl sm:text-7xl md:text-8xl px-2">
            Animated Story Fables
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Transform long letters, memory recaps, anniversary notes, and quiet thanks into an in-browser animated video experience with word-by-word narrated lyrics, ambient music, and magical visual atmospheres.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center items-center gap-3 sm:gap-4 pt-4"
        >
          <button
            onClick={onStartClick}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold text-base sm:text-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <Wand2 className="w-5 h-5" />
            <span>Create LoveFable Now</span>
          </button>

          <button
            onClick={onExplorePresets}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/90 hover:bg-white text-slate-700 hover:text-pink-600 font-semibold text-base border border-pink-200/80 shadow-xs transition-all cursor-pointer"
          >
            <Play className="w-4 h-4 fill-pink-500 text-pink-500" />
            <span>Try Quick Example</span>
          </button>

          {savedCount > 0 && (
            <button
              onClick={onOpenLibrary}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-base border border-purple-200 shadow-xs transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Saved Library ({savedCount})</span>
            </button>
          )}
        </motion.div>

        {/* Feature Pills */}
        <div className="pt-6 flex flex-wrap justify-center items-center gap-4 text-xs sm:text-sm text-slate-500">
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-pink-100">
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-400" />
            <span>9 Visual Moods</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-pink-100">
            <Music className="w-3.5 h-3.5 text-purple-500" />
            <span>Web Synth BGM & Narration</span>
          </div>
          <div className="flex items-center gap-1.5 bg-white/60 px-3 py-1 rounded-full border border-pink-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Offline Story Mode Ready</span>
          </div>
        </div>
      </div>
    </section>
  );
};
