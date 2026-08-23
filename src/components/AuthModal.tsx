import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Sparkles, Heart, ShieldCheck, ArrowRight } from 'lucide-react';
import { User } from '../types';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInSuccess: (user: User) => void;
  initialMode?: 'signin' | 'signup';
  interceptMessage?: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignInSuccess,
  initialMode = 'signin',
  interceptMessage,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setError(null);
    try {
      let resultUser;
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
        resultUser = result.user;
      } else {
        const result = await signInWithEmailAndPassword(auth, email.trim(), password);
        resultUser = result.user;
      }

      const loggedInUser: User = {
        id: resultUser.uid,
        name: mode === 'signup' ? name.trim() : (resultUser.displayName || email.split('@')[0] || 'User').replace(/[^a-zA-Z0-9]/g, ' '),
        email: resultUser.email || email.trim(),
        plan: 'Free',
        credits: 3,
      };

      onSignInSuccess(loggedInUser);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Authentication failed.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const loggedInUser: User = {
        id: user.uid,
        name: user.displayName || 'Google User',
        email: user.email || '',
        avatarUrl: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        plan: 'Free',
        credits: 3,
      };
      onSignInSuccess(loggedInUser);
      onClose();
    } catch (err: unknown) {
      setError((err as Error).message || 'Failed to sign in with Google.');
    }
  };

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
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-pink-100 overflow-hidden"
        >
          {/* Header Graphic */}
          <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-6 text-white text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all cursor-pointer" aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 mx-auto rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/30 shadow-inner">
              <Heart className="w-6 h-6 fill-white text-white animate-pulse" />
            </div>

            <h3 className="text-2xl font-bold font-quicksand">
              {mode === 'signin' ? 'Welcome Back to LoveFable' : 'Create Your Account'}
            </h3>
            <p className="text-xs text-pink-100 mt-1">
              {mode === 'signin'
                ? 'Sign in to generate, narrate, and save video fables'
                : 'Join LoveFable AI to save custom storyboards'}
            </p>

            {interceptMessage && (
              <div className="mt-3 py-1.5 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-semibold text-white flex items-center justify-center gap-1.5 animate-bounce">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{interceptMessage}</span>
              </div>
            )}
          </div>

          <div className="p-6 space-y-5">
            {/* Google Sign In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-bold transition-all flex items-center justify-center gap-3 cursor-pointer shadow-sm group"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">
                Or enter details
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-medium border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 text-sm outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 focus:bg-white border border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 text-sm outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
              {mode === 'signin' ? (
                <p>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className="text-pink-600 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className="text-pink-600 font-bold hover:underline cursor-pointer ml-1"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Secured by Firebase Authentication</span>
            </div>
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
