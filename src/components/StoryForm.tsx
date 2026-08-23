import React, { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, Layers, Volume2, MessageSquare, Check, Wifi, WifiOff } from 'lucide-react';
import { Tone, Storyboard, User } from '../types';
import { TONE_OPTIONS, VISUAL_THEMES, PRESET_MESSAGES, OFFLINE_STORYBOARDS } from '../data/presets';

interface StoryFormProps {
  onStoryGenerated: (storyboard: Storyboard) => void;
  isOffline: boolean;
  user: User | null;
  onRequireAuth: (interceptMessage?: string) => void;
  tier: 'Free' | 'Pro';
  generationsToday: number;
  onOpenPricing: (limitReached?: boolean) => void;
}

export const StoryForm: React.FC<StoryFormProps> = ({
  onStoryGenerated,
  isOffline,
  user,
  onRequireAuth,
  tier,
  generationsToday,
  onOpenPricing,
}) => {
  const [message, setMessage] = useState('');
  const [selectedTone, setSelectedTone] = useState<Tone>('Romance');
  const [selectedThemeId, setSelectedThemeId] = useState('pastel_dream');
  const [sceneCount, setSceneCount] = useState<number>(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const handleApplyPreset = (presetId: string) => {
    const preset = PRESET_MESSAGES.find(p => p.id === presetId);
    if (preset) {
      setMessage(preset.message);
      setSelectedTone(preset.recommendedTone);
      setSelectedThemeId(preset.recommendedTheme);
    }
  };

  const handleGenerate = async () => {
    // Intercept click if user is logged out!
    if (!user) {
      onRequireAuth('Please sign in to create the video');
      return;
    }

    // Block generation if Free tier user has reached 3 videos today
    if (tier === 'Free' && generationsToday >= 3) {
      setErrorNotice('Daily generation limit reached (3/3 videos). Upgrade to Pro for unlimited videos!');
      onOpenPricing(true);
      return;
    }

    if (!message.trim()) {
      setErrorNotice('Please paste or write a personal message to begin.');
      return;
    }

    setErrorNotice(null);
    setIsGenerating(true);
    setLoadingStep('Understanding message tone & emotional beat...');

    const themeObj = VISUAL_THEMES.find(t => t.id === selectedThemeId) || VISUAL_THEMES[0];

    try {
      if (isOffline) {
        // Offline story generator fallback
        await new Promise(r => setTimeout(r, 1200));
        setLoadingStep('Crafting offline storyboard scenes...');

        // Find a matching offline template or construct one dynamically
        const baseOffline = OFFLINE_STORYBOARDS[0];
        const newStoryboard: Storyboard = {
          ...baseOffline,
          id: `fable-${Date.now()}`,
          title: message.length > 30 ? `${message.substring(0, 24)}...` : 'Your Personal LoveFable',
          subtitle: `A ${selectedTone.toLowerCase()} story of affection`,
          tone: selectedTone,
          visualTheme: themeObj.name,
          originalMessage: message,
          createdAt: Date.now(),
        };
        onStoryGenerated(newStoryboard);
        setIsGenerating(false);
        return;
      }

      // Online API Call to Express server backend
      setLoadingStep('Consulting Gemini AI for storyboard composition...');

      const response = await fetch('/api/generate-storyboard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          tone: selectedTone,
          visualTheme: themeObj.name,
          visualMood: themeObj.mood,
          sceneCount,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reach Gemini backend API.');
      }

      setLoadingStep('Finalizing scene durations & visual cues...');
      const data = await response.json();

      if (data.storyboard) {
        onStoryGenerated(data.storyboard);
      } else {
        throw new Error('Received invalid storyboard schema.');
      }
    } catch (err: unknown) {
      console.warn('Gemini generation error, switching to intelligent client fallback:', err);
      // Fallback generator so app experience NEVER breaks!
      const fallbackStoryboard: Storyboard = {
        id: `fable-fallback-${Date.now()}`,
        title: 'Echoes of the Heart',
        subtitle: `A ${selectedTone.toLowerCase()} narrative`,
        overallEmotion: 'Warm Heartfelt Connection',
        bgMusicMood: 'soft_piano',
        visualTheme: themeObj.name,
        tone: selectedTone,
        originalMessage: message,
        createdAt: Date.now(),
        scenes: [
          {
            id: 1,
            sceneTitle: 'Opening Memory',
            narrationText: message.length > 80 ? message.substring(0, 80) + '...' : message,
            visualMood: themeObj.mood,
            duration: 10,
            emotionPrompt: 'Warm affection and nostalgia',
            bgGradient: 'linear-gradient(to bottom, #fce7f3, #fbcfe8, #f472b6)',
            accentColor: '#ec4899',
            keyQuote: 'Every memory begins with a single spark.',
          },
          {
            id: 2,
            sceneTitle: 'The Quiet Bond',
            narrationText: 'In the quiet spaces between words, something gentle and unbreakable grew between us.',
            visualMood: 'starlight',
            duration: 10,
            emotionPrompt: 'Peaceful intimacy',
            bgGradient: 'linear-gradient(to bottom, #0f172a, #1e1b4b, #311042)',
            accentColor: '#fb7185',
            keyQuote: 'Something gentle and unbreakable grew.',
          },
          {
            id: 3,
            sceneTitle: 'Through Every Season',
            narrationText: 'No matter how the weather changes outside, your warmth remains my favorite season.',
            visualMood: 'falling_petals',
            duration: 10,
            emotionPrompt: 'Enduring devotion',
            bgGradient: 'linear-gradient(to bottom, #fff1f2, #fce7f3, #fbcfe8)',
            accentColor: '#f43f5e',
            keyQuote: 'Your warmth remains my favorite season.',
          },
          {
            id: 4,
            sceneTitle: 'Everlasting Promise',
            narrationText: 'Here is to every tomorrow we will share, hand in hand under the same bright sky.',
            visualMood: 'sunrise',
            duration: 11,
            emotionPrompt: 'Radiant hope for the future',
            bgGradient: 'linear-gradient(to bottom, #7c2d12, #9a3412, #c2410c)',
            accentColor: '#fb923c',
            keyQuote: 'Hand in hand under the same bright sky.',
          },
        ],
      };
      onStoryGenerated(fallbackStoryboard);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div id="create-section" className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-xl border border-pink-100/80 space-y-8">
        {/* Form Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-pink-100 pb-5">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-pink-500" />
              <span>Craft Your LoveFable</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Paste your personal letter or note below to generate an animated narrated story.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isOffline ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200">
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                <span>Offline Mode</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-200">
                <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                <span>Gemini Online</span>
              </span>
            )}
          </div>
        </div>

        {/* Preset Sample Picker */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>Quick Start with Example Messages</span>
            <span className="text-pink-600 normal-case font-normal">Click to fill</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {PRESET_MESSAGES.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset.id)}
                className="text-left p-3 rounded-2xl bg-rose-50/60 hover:bg-pink-100/70 border border-pink-200/60 transition-all text-xs cursor-pointer group"
              >
                <div className="font-bold text-slate-700 group-hover:text-pink-600 truncate">
                  {preset.title}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5 truncate">{preset.category}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Text Area */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
            <span>Your Personal Message</span>
            <span className="text-slate-400 font-normal">{message.length} characters</span>
          </label>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Paste or write your letter here... (e.g., 'Looking back at our five years together, every quiet coffee morning and starry night conversation has meant the world to me...')"
              rows={5}
              className="w-full p-4 rounded-2xl bg-slate-50/80 focus:bg-white border border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 text-slate-800 placeholder-slate-400 text-base leading-relaxed transition-all resize-y outline-none"
            />
            {message && (
              <button
                onClick={() => setMessage('')}
                className="absolute top-3 right-3 text-xs text-slate-400 hover:text-slate-600 bg-white/80 px-2 py-1 rounded-md border border-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Story Tone
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {TONE_OPTIONS.map((tone) => {
              const isSelected = selectedTone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setSelectedTone(tone.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md scale-102 font-bold'
                      : 'bg-slate-50 hover:bg-rose-50 text-slate-700 border-slate-200 hover:border-pink-300'
                  }`}
                >
                  <span className="text-xl mb-1">{tone.emoji}</span>
                  <span className="text-xs">{tone.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Theme Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Visual Background Atmosphere
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {VISUAL_THEMES.map((theme) => {
              const isSelected = selectedThemeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setSelectedThemeId(theme.id)}
                  className={`relative flex items-center gap-3 p-3.5 rounded-2xl border transition-all text-left cursor-pointer overflow-hidden ${
                    isSelected
                      ? 'border-pink-500 ring-2 ring-pink-400/50 bg-white shadow-md'
                      : 'border-slate-200 hover:border-pink-300 bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${theme.gradient} shrink-0 shadow-xs`}
                  >
                    {theme.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-800 flex items-center justify-between">
                      <span>{theme.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-pink-500 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">{theme.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scene Count & Voice Option Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-rose-50/50 border border-pink-100 text-xs sm:text-sm text-slate-700">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-pink-500" />
            <span className="font-semibold">Storyboard Length:</span>
            <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-pink-200">
              {[4, 5, 6].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setSceneCount(count)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    sceneCount === count
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-pink-600'
                  }`}
                >
                  {count} Scenes
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500">
            <Volume2 className="w-4 h-4 text-purple-500" />
            <span>Narrated word-by-word with ambient music</span>
          </div>
        </div>

        {/* Error Notice */}
        {errorNotice && (
          <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-800 text-xs font-semibold border border-rose-300">
            {errorNotice}
          </div>
        )}

        {/* Submit Button & Generation Counter */}
        <div className="pt-2 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-500" />
              <span>Current Plan: <strong className="text-slate-800">{tier} Tier</strong></span>
            </div>

            {tier === 'Free' ? (
              <button
                type="button"
                onClick={() => onOpenPricing(false)}
                className="px-2.5 py-1 rounded-full bg-pink-100 hover:bg-pink-200 text-pink-700 text-xs font-bold border border-pink-200 flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>{Math.max(0, 3 - generationsToday)}/3 left today</span>
                <span className="underline ml-1 text-[10px]">Upgrade</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold border border-purple-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Unlimited Creations</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>{loadingStep || 'Weaving LoveFable...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5" />
                <span>Create the video</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
