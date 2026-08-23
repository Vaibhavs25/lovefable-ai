export type VisualMood = 
  | 'starlight'
  | 'falling_petals'
  | 'rain'
  | 'sunrise'
  | 'fireflies'
  | 'floating_hearts'
  | 'aurora'
  | 'soft_bokeh'
  | 'autumn_breeze';

export type Tone = 
  | 'Romance'
  | 'Nostalgic'
  | 'Whimsical'
  | 'Poetic'
  | 'Playful'
  | 'Cinematic';

export interface Scene {
  id: number;
  sceneTitle: string;
  narrationText: string;
  visualMood: VisualMood;
  duration: number; // in seconds, e.g. 8 - 14
  emotionPrompt: string; // e.g. "Warm affection and quiet joy"
  bgGradient: string; // CSS gradient string for background overlay
  accentColor: string; // hex or tailwind class
  keyQuote: string; // Short memorable line for bookmarking
}

export interface Storyboard {
  id: string;
  title: string;
  subtitle: string;
  overallEmotion: string;
  bgMusicMood: 'soft_piano' | 'music_box' | 'rain_ambient' | 'chill_lofi' | 'romantic_strings';
  visualTheme: string;
  tone: Tone;
  originalMessage: string;
  createdAt: number;
  scenes: Scene[];
  relationship?: 'Partner' | 'Sister' | 'Best Friend' | 'Parent' | 'Soulmate' | 'Other';
}

export interface SavedFable {
  id: string;
  storyboard: Storyboard;
  savedAt: number;
  isFavorite: boolean;
}

export interface BookmarkedScene {
  id: string;
  fableId: string;
  fableTitle: string;
  scene: Scene;
  bookmarkedAt: number;
}

export interface PresetMessage {
  id: string;
  title: string;
  category: string;
  message: string;
  recommendedTone: Tone;
  recommendedTheme: string;
}

export interface AudioSettings {
  voiceEnabled: boolean;
  musicEnabled: boolean;
  voiceVolume: number;
  musicVolume: number;
  voiceSpeed: number;
  voiceGender: 'female' | 'male' | 'soft';
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: 'Free' | 'Pro' | 'VIP';
  credits: number;
}

