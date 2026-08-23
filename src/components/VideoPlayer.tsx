import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Bookmark,
  Heart,
  Share2,
  Maximize2,
  Minimize2,
  Sparkles,
  Download,
  ListVideo,
  Film,
  Settings2,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Storyboard, Scene, AudioSettings } from '../types';
import { AnimatedBackground } from './AnimatedBackground';
import { NarrationText } from './NarrationText';
import { bgMusicSynth, speechNarrator } from '../utils/audioSynth';
import { recordCanvasToVideo, isRecordingSupported } from '../utils/videoExport';

interface VideoPlayerProps {
  storyboard: Storyboard;
  onBookmarkScene: (scene: Scene) => void;
  onSaveFable: (storyboard: Storyboard) => void;
  isFableSaved: boolean;
  bookmarkedSceneIds: number[];
  onBackToEdit: () => void;
  tier?: 'Free' | 'Pro';
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  storyboard,
  onBookmarkScene,
  onSaveFable,
  isFableSaved,
  bookmarkedSceneIds,
  onBackToEdit,
  tier = 'Free',
}) => {
  const [currentSceneIdx, setCurrentSceneIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sceneProgress, setSceneProgress] = useState(0); // 0 to 1
  const [speed, setSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number | undefined>(undefined);
  const [showAudioSettings, setShowAudioSettings] = useState(false);
  const [localMusicMood, setLocalMusicMood] = useState(storyboard.bgMusicMood);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalMusicMood(storyboard.bgMusicMood);
  }, [storyboard.bgMusicMood]);

  // Video export state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const recorderRef = useRef<{ stop: () => void } | null>(null);

  const [audioSettings, setAudioSettings] = useState<AudioSettings>({
    voiceEnabled: true,
    musicEnabled: true,
    voiceVolume: 0.8,
    musicVolume: 0.5,
    voiceSpeed: 1.0,
    voiceGender: 'female',
  });

  const playerRef = useRef<HTMLDivElement | null>(null);
  const currentScene = storyboard.scenes[currentSceneIdx] || storyboard.scenes[0];
  const sceneDuration = currentScene?.duration || 10; // in seconds

  // Handle Play / Pause
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Trigger celebration heart confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#f472b6', '#fb7185', '#c084fc', '#fde047'],
    });
  };

  // Audio Music BGM Management
  useEffect(() => {
    if (isPlaying && audioSettings.musicEnabled) {
      bgMusicSynth.startMusic(localMusicMood, audioSettings.musicVolume);
    } else {
      bgMusicSynth.stopMusic();
    }

    return () => {
      bgMusicSynth.stopMusic();
    };
  }, [isPlaying, audioSettings.musicEnabled, localMusicMood, audioSettings.musicVolume]);

  // Voice Narration Management
  useEffect(() => {
    if (isPlaying && audioSettings.voiceEnabled && currentScene) {
      speechNarrator.speak(
        currentScene.narrationText,
        audioSettings.voiceGender,
        speed * audioSettings.voiceSpeed,
        audioSettings.voiceVolume,
        (wordIdx) => {
          setActiveWordIndex(wordIdx);
        },
        () => {
          // Finished narration
        }
      );
    } else {
      speechNarrator.stop();
    }

    return () => {
      speechNarrator.stop();
    };
  }, [currentScene, currentSceneIdx, isPlaying, audioSettings.voiceEnabled, speed, audioSettings.voiceGender, audioSettings.voiceVolume, audioSettings.voiceSpeed]);

  // Scene Progress Clock Timer
  useEffect(() => {
    if (!isPlaying) return;

    const intervalMs = 50;
    const increment = (intervalMs / 1000) / (sceneDuration / speed);

    const timer = setInterval(() => {
      setSceneProgress(prev => {
        const next = prev + increment;
        if (next >= 1) {
          // Move to next scene
          if (currentSceneIdx < storyboard.scenes.length - 1) {
            setCurrentSceneIdx(c => c + 1);
            return 0;
          } else {
            // Reached end of storyboard
            setIsPlaying(false);
            triggerConfetti();
            return 1;
          }
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, currentSceneIdx, sceneDuration, speed, storyboard.scenes.length]);

  // Jump to specific scene
  const goToScene = (index: number) => {
    speechNarrator.stop();
    setCurrentSceneIdx(index);
    setSceneProgress(0);
    setActiveWordIndex(undefined);
  };

  // Prev Scene
  const handlePrev = () => {
    if (currentSceneIdx > 0) {
      goToScene(currentSceneIdx - 1);
    } else {
      setSceneProgress(0);
    }
  };

  // Next Scene
  const handleNext = () => {
    if (currentSceneIdx < storyboard.scenes.length - 1) {
      goToScene(currentSceneIdx + 1);
    } else {
      setSceneProgress(1);
      setIsPlaying(false);
    }
  };

  // Replay current scene
  const handleReplay = () => {
    setSceneProgress(0);
    setActiveWordIndex(undefined);
    if (!isPlaying) setIsPlaying(true);
  };

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(err => console.error(err));
      setIsFullscreen(false);
    }
  };

  // Export / Download transcript text
  const handleDownloadTranscript = () => {
    const textLines = [
      `LOVEFABLE AI: ${storyboard.title.toUpperCase()}`,
      `Subtitle: ${storyboard.subtitle}`,
      `Tone: ${storyboard.tone} | Emotion: ${storyboard.overallEmotion}`,
      `Date: ${new Date(storyboard.createdAt).toLocaleDateString()}`,
      `----------------------------------------------------`,
      ...storyboard.scenes.map(
        (s, i) => `\n[Scene ${i + 1}: ${s.sceneTitle}] (${s.visualMood})\n"${s.narrationText}"`
      ),
      `\n----------------------------------------------------`,
      `Original Letter:\n${storyboard.originalMessage}`,
    ].join('\n');

    const blob = new Blob([textLines], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyboard.title.replace(/[^a-z0-9]/gi, '_')}_transcript.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Share Fable Link
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareNotification(true);
    setTimeout(() => setShowShareNotification(false), 2500);
  };

  const isCurrentBookmarked = bookmarkedSceneIds.includes(currentScene.id);

  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-4 py-6 space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 rounded-3xl border border-pink-100 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToEdit}
            className="px-3.5 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-all cursor-pointer"
          >
            ← New Story
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-800 font-quicksand flex items-center gap-2">
              <span>{storyboard.title}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-normal">
                {storyboard.tone}
              </span>
            </h2>
            <p className="text-xs text-slate-500">{storyboard.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Save Fable Button */}
          <button
            onClick={() => {
              onSaveFable(storyboard);
              triggerConfetti();
            }}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
              isFableSaved
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-pink-500 hover:bg-pink-600 text-white shadow-xs'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFableSaved ? 'fill-emerald-700' : 'fill-white'}`} />
            <span>{isFableSaved ? 'Saved in Library' : 'Save Story'}</span>
          </button>

          {/* Download Transcript */}
          <button
            onClick={handleDownloadTranscript}
            title="Download Transcript"
            aria-label="Download text transcript"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Export Video */}
          {isRecordingSupported() && (
            <button
              onClick={() => {
                if (isRecording) {
                  recorderRef.current?.stop();
                  setIsRecording(false);
                  setRecordingProgress(0);
                  return;
                }
                const canvas = document.querySelector('#animated-bg-canvas canvas') as HTMLCanvasElement;
                if (!canvas) return;
                const totalDuration = storyboard.scenes.reduce((sum, s) => sum + s.duration, 0) * 1000;
                recorderRef.current = recordCanvasToVideo({
                  canvas,
                  durationMs: totalDuration,
                  filename: storyboard.title.replace(/[^a-z0-9]/gi, '_'),
                  onStart: () => setIsRecording(true),
                  onProgress: (p) => setRecordingProgress(p),
                  onComplete: () => {
                    setIsRecording(false);
                    setRecordingProgress(0);
                  },
                  onError: (err) => {
                    setIsRecording(false);
                    setRecordingProgress(0);
                    console.error('Video export error:', err);
                  },
                });
              }}
              title={isRecording ? 'Stop Recording' : 'Export as Video'}
              aria-label={isRecording ? 'Stop video recording' : 'Export story as video'}
              className={`relative p-2 rounded-full transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Film className="w-4 h-4" />
              {isRecording && (
                <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-bold text-rose-600 whitespace-nowrap">
                  {Math.round(recordingProgress * 100)}%
                </span>
              )}
            </button>
          )}

          {/* Share Button */}
          <button
            onClick={handleShare}
            title="Share LoveFable Link"
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all cursor-pointer relative"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showShareNotification && (
        <div className="text-center py-2 px-4 rounded-xl bg-pink-500 text-white text-xs font-bold shadow-md animate-fade-in">
          Link copied to clipboard! Share your LoveFable with your favorite person ✨
        </div>
      )}

      {/* Main Player Screen Frame */}
      <div
        ref={playerRef}
        className={`relative overflow-hidden rounded-3xl shadow-2xl border border-pink-200/80 transition-all ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'aspect-video min-h-[380px] sm:min-h-[460px]'
        }`}
      >
        {/* Procedural Animated Background for Current Scene */}
        <div id="animated-bg-canvas">
          <AnimatedBackground
            mood={currentScene.visualMood}
            bgGradient={currentScene.bgGradient}
            accentColor={currentScene.accentColor}
          />
        </div>

        {/* Top Overlay Badges */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-auto">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-white text-xs font-semibold border border-white/20 shadow-xs">
              Scene {currentSceneIdx + 1} of {storyboard.scenes.length}: {currentScene.sceneTitle}
            </span>
            <span className="hidden sm:inline-block px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs capitalize border border-white/20">
              Mood: {currentScene.visualMood.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Bookmark Current Scene Button */}
            <button
              onClick={() => onBookmarkScene(currentScene)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md text-xs font-bold transition-all cursor-pointer shadow-xs border ${
                isCurrentBookmarked
                  ? 'bg-amber-400 text-slate-900 border-amber-300'
                  : 'bg-black/30 hover:bg-black/50 text-white border-white/30'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentBookmarked ? 'fill-slate-900' : ''}`} />
              <span>{isCurrentBookmarked ? 'Bookmarked' : 'Bookmark Scene'}</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md border border-white/20 cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center Canvas Narration Display Card */}
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center p-6 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene.id}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl bg-white/40 backdrop-blur-xl p-6 sm:p-10 rounded-3xl border border-white/40 shadow-2xl space-y-4"
            >
              <div className="text-xs uppercase tracking-widest font-bold text-pink-600/90">
                {currentScene.emotionPrompt}
              </div>

              {/* Word-by-Word Narration Text Component */}
              <NarrationText
                text={currentScene.narrationText}
                progress={sceneProgress}
                activeWordIndex={activeWordIndex}
                accentColor={currentScene.accentColor}
                keyQuote={currentScene.keyQuote}
              />

              {currentScene.keyQuote && (
                <div className="pt-2 italic text-slate-600 font-sacramento text-lg sm:text-2xl">
                  "{currentScene.keyQuote}"
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Free Tier Watermark Chip */}
        {tier === 'Free' && (
          <div className="absolute bottom-20 right-4 z-20 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 flex items-center gap-1.5 shadow-lg pointer-events-none select-none">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="tracking-wide">LoveFable</span>
            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-pink-500/80 text-white ml-0.5">FREE</span>
          </div>
        )}

        {/* Audio Settings Panel Overlay */}
        <AnimatePresence>
          {showAudioSettings && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-24 left-4 z-30 w-72 bg-slate-900/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl text-white pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                <h3 className="font-bold text-sm">Audio & Voice</h3>
                <button onClick={() => setShowAudioSettings(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-semibold">
                <div className="space-y-2">
                  <label className="text-white/70 uppercase tracking-wider text-[10px]">Narrator Voice</label>
                  <div className="flex gap-2">
                    {['female', 'male', 'soft'].map((v) => (
                      <button
                        key={v}
                        onClick={() => setAudioSettings(a => ({ ...a, voiceGender: v as 'female' | 'male' | 'soft' }))}
                        className={`flex-1 py-1.5 rounded-lg border cursor-pointer transition-colors capitalize ${audioSettings.voiceGender === v ? 'bg-pink-500 border-pink-400' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-white/70 uppercase tracking-wider text-[10px]">Background Music</label>
                  <select
                    value={localMusicMood}
                    onChange={(e) => setLocalMusicMood(e.target.value as 'soft_piano' | 'music_box' | 'rain_ambient' | 'chill_lofi' | 'romantic_strings')}
                    className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs outline-none focus:border-pink-500 transition-colors"
                  >
                    <option value="soft_piano">Soft Piano</option>
                    <option value="music_box">Music Box</option>
                    <option value="rain_ambient">Rain Ambient</option>
                    <option value="chill_lofi">Chill Lofi</option>
                    <option value="romantic_strings">Romantic Strings</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-white/70 uppercase tracking-wider">
                    <span>Voice Volume</span>
                    <span>{Math.round(audioSettings.voiceVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioSettings.voiceVolume}
                    onChange={(e) => setAudioSettings(a => ({ ...a, voiceVolume: parseFloat(e.target.value) }))}
                    className="w-full accent-pink-500 cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] text-white/70 uppercase tracking-wider">
                    <span>Music Volume</span>
                    <span>{Math.round(audioSettings.musicVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={audioSettings.musicVolume}
                    onChange={(e) => setAudioSettings(a => ({ ...a, musicVolume: parseFloat(e.target.value) }))}
                    className="w-full accent-purple-500 cursor-pointer"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom Playback Control Bar Overlay */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-slate-950/80 via-slate-900/40 to-transparent backdrop-blur-xs space-y-3">
          {/* Progress Bar Scrubber */}
          <div className="space-y-1">
            <div className="relative w-full h-2 bg-white/20 hover:h-3 rounded-full cursor-pointer transition-all overflow-hidden group">
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={sceneProgress}
                onChange={(e) => setSceneProgress(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
              />
              <div
                className="h-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 rounded-full transition-all"
                style={{ width: `${sceneProgress * 100}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-white/80 font-mono">
              <span>
                {Math.floor(sceneProgress * sceneDuration)}s / {sceneDuration}s
              </span>
              <span>
                Total Fable: Scene {currentSceneIdx + 1} / {storyboard.scenes.length}
              </span>
            </div>
          </div>

          {/* Controls Buttons Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-white">
            {/* Left Controls: Audio Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAudioSettings(prev => !prev)}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  showAudioSettings
                    ? 'bg-white text-slate-900 border-white'
                    : 'bg-white/10 text-white/60 border-white/20 hover:text-white'
                }`}
                title="Audio Settings"
              >
                <Settings2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setAudioSettings(a => ({ ...a, voiceEnabled: !a.voiceEnabled }))}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  audioSettings.voiceEnabled
                    ? 'bg-pink-500 text-white border-pink-400'
                    : 'bg-white/10 text-white/60 border-white/20'
                }`}
                title="Toggle Voice Narration"
                aria-label={audioSettings.voiceEnabled ? 'Disable voice narration' : 'Enable voice narration'}
              >
                {audioSettings.voiceEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setAudioSettings(a => ({ ...a, musicEnabled: !a.musicEnabled }))}
                className={`p-2 rounded-full border transition-all cursor-pointer ${
                  audioSettings.musicEnabled
                    ? 'bg-purple-500 text-white border-purple-400'
                    : 'bg-white/10 text-white/60 border-white/20'
                }`}
                title="Toggle Ambient BGM Music"
                aria-label={audioSettings.musicEnabled ? 'Mute background music' : 'Unmute background music'}
              >
                {audioSettings.musicEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Center Controls: Play/Pause/Nav */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Previous Scene"
                aria-label="Go to previous scene"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={togglePlay}
                className="p-3.5 rounded-full bg-pink-500 hover:bg-pink-600 text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
              >
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
              </button>

              <button
                onClick={handleNext}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Next Scene"
                aria-label="Go to next scene"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              <button
                onClick={handleReplay}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all cursor-pointer"
                title="Replay Scene"
                aria-label="Replay current scene"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Right Controls: Speed Selector */}
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-full border border-white/20 text-xs">
              {[0.75, 1.0, 1.25, 1.5].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                    speed === s ? 'bg-pink-500 font-bold text-white' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scene Carousel Thumbnails / Jump Bar */}
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
          <ListVideo className="w-4 h-4 text-pink-500" />
          <span>Storyboard Scene Timeline</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {storyboard.scenes.map((scene, idx) => {
            const isActive = idx === currentSceneIdx;
            return (
              <button
                key={scene.id}
                onClick={() => goToScene(idx)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'border-pink-500 bg-pink-50/80 shadow-md ring-2 ring-pink-300'
                    : 'border-pink-100 bg-white hover:bg-rose-50/50'
                }`}
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Scene {idx + 1}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-700 font-normal">
                    {scene.duration}s
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-800 truncate">{scene.sceneTitle}</div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">{scene.narrationText}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
