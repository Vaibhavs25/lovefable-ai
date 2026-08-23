import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Play, Share2, Sparkles, Heart, Clock, Calendar, Plus, Wand2, Tag, Trash2 } from 'lucide-react';
import { Storyboard } from '../types';

interface MyStoriesViewProps {
  storyboards: Storyboard[];
  onPlayFable: (storyboard: Storyboard) => void;
  onShareFable: (storyboard: Storyboard) => void;
  onDeleteStory: (storyboardId: string) => void;
  onCreateNewClick: () => void;
}

export const MyStoriesView: React.FC<MyStoriesViewProps> = ({
  storyboards,
  onPlayFable,
  onShareFable,
  onDeleteStory,
  onCreateNewClick,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  // Metadata mapping for tags and thumbnail gradients
  const getStoryMetadata = (storyboard: Storyboard, index: number) => {
    const defaultGradients = [
      'from-pink-600 via-rose-500 to-purple-800',
      'from-amber-600 via-rose-600 to-purple-900',
      'from-purple-700 via-indigo-800 to-slate-900',
      'from-emerald-600 via-teal-700 to-slate-900',
      'from-rose-500 via-pink-600 to-orange-500',
    ];

    const emotionBadges = ['Warm Romance', 'Bittersweet Nostalgia', 'Joyful Whimsy', 'Deep Gratitude', 'Soulful Love'];

    const gradient = defaultGradients[index % defaultGradients.length];
    // Use real relationship field, with tone-based inference as fallback
    const relationship = storyboard.relationship || (storyboard.tone === 'Romance' ? 'Partner' : 'Other');
    const emotion = storyboard.overallEmotion || emotionBadges[index % emotionBadges.length];

    // Format date string
    const dateObj = new Date(storyboard.createdAt || 1700000000000 + index * 86400000);
    const dateStr = dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return { gradient, relationship, emotion, dateStr };
  };

  const filters = ['All', 'Partner', 'Sister', 'Best Friend', 'Parent', 'Soulmate'];

  const filteredStories = storyboards.filter((sb, idx) => {
    if (selectedFilter === 'All') return true;
    const meta = getStoryMetadata(sb, idx);
    return meta.relationship === selectedFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-pink-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Your Personal Library</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-quicksand">My LoveFables</h2>
          <p className="text-xs sm:text-sm text-pink-100 font-medium">
            Revisit your cherished animated stories, share them with loved ones, or generate new personal fables.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 shrink-0">
          <button
            onClick={onCreateNewClick}
            className="px-5 py-3 rounded-2xl bg-white text-pink-600 hover:bg-pink-50 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
          >
            <Wand2 className="w-4 h-4 text-pink-500" />
            <span>Create New Fable</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Filter Tabs & Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-pink-100 pb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedFilter === filter
                  ? 'bg-pink-500 text-white shadow-sm'
                  : 'bg-white hover:bg-pink-50 text-slate-600 border border-slate-200/80 hover:border-pink-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Showing <span className="text-pink-600">{filteredStories.length}</span> {filteredStories.length === 1 ? 'story' : 'stories'}
        </div>
      </div>

      {/* Grid of Story Cards */}
      {filteredStories.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-pink-200 p-8 space-y-4">
          <div className="w-16 h-16 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No stories found under "{selectedFilter}"</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try switching filter category or create a brand new fable for your special someone.
          </p>
          <button
            onClick={onCreateNewClick}
            className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create a Story</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStories.map((storyboard, idx) => {
            const meta = getStoryMetadata(storyboard, idx);
            const totalDuration = storyboard.scenes.reduce((acc, s) => acc + s.duration, 0);

            return (
              <motion.div
                key={storyboard.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="group bg-white rounded-3xl border border-slate-200/90 hover:border-pink-300 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                {/* Gradient Thumbnail Header */}
                <div className={`h-48 bg-gradient-to-br ${meta.gradient} p-5 relative flex flex-col justify-between overflow-hidden`}>
                  {/* Floating Badges */}
                  <div className="flex justify-between items-start gap-2 relative z-10">
                    <span className="px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-pink-300" />
                      <span>{meta.relationship}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
                      <Clock className="w-3 h-3" />
                      <span>{totalDuration}s</span>
                    </span>
                  </div>

                  {/* Emotion Badge Pill */}
                  <div className="relative z-10">
                    <div className="inline-block px-3 py-1 rounded-xl bg-slate-900/60 backdrop-blur-md text-white text-xs font-extrabold border border-white/20 shadow-md">
                      ✨ {meta.emotion}
                    </div>
                  </div>

                  {/* Play Hover Overlay Button */}
                  <button
                    onClick={() => onPlayFable(storyboard)}
                    className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 group-hover:bg-slate-950/40 transition-all opacity-90 group-hover:opacity-100 cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/90 group-hover:bg-white text-pink-600 flex items-center justify-center shadow-2xl transition-all transform group-hover:scale-110">
                      <Play className="w-6 h-6 fill-pink-600 ml-1" />
                    </div>
                  </button>

                  {/* Ambient Light Effect */}
                  <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/20 rounded-full blur-xl pointer-events-none" />
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-1 font-quicksand">
                      {storyboard.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {storyboard.subtitle || storyboard.originalMessage}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-pink-400" />
                      <span>{meta.dateStr}</span>
                    </div>
                    <span>{storyboard.scenes.length} Scenes</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <button
                      onClick={() => onPlayFable(storyboard)}
                      className="py-2.5 px-3 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-pink-600 text-pink-600" />
                      <span>Play</span>
                    </button>

                    <button
                      onClick={() => onShareFable(storyboard)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => onDeleteStory(storyboard.id)}
                      className="py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
