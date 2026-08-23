import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Bookmark, WifiOff, LogIn, Film, PlusCircle } from 'lucide-react';
import { Storyboard, SavedFable, BookmarkedScene, Scene, User } from './types';
import { useAppState, useAppDispatch } from './context/AppContext';
import { HeroSection } from './components/HeroSection';
import { StoryForm } from './components/StoryForm';
import { VideoPlayer } from './components/VideoPlayer';
import { LibraryModal } from './components/LibraryModal';
import { BookmarkedScenesModal } from './components/BookmarkedScenesModal';
import { AuthModal } from './components/AuthModal';
import { UserDropdown } from './components/UserDropdown';
import { ProfileModal } from './components/ProfileModal';
import { BillingModal } from './components/BillingModal';
import { PricingModal } from './components/PricingModal';
import { CheckoutModal } from './components/CheckoutModal';
import { MyStoriesView } from './components/MyStoriesView';
import { ShareModal } from './components/ShareModal';
import { Footer } from './components/Footer';

export default function App() {
  const state = useAppState();
  const dispatch = useAppDispatch();

  const {
    activeStoryboard, activeTab, myStories, shareModalStoryboard,
    savedFables, bookmarkedScenes,
    isLibraryOpen, isBookmarksOpen, isPricingOpen, isCheckoutOpen,
    isAuthModalOpen, isProfileOpen, isBillingOpen,
    isOffline, tier, generationsToday, limitReachedAlert,
    user, authInterceptMessage,
  } = state;

  // ─── Handlers ────────────────────────────────────────────

  const handleRequireAuth = (message?: string) => {
    if (!user) {
      dispatch({ type: 'SET_AUTH_INTERCEPT', payload: message || 'Please sign in to create the video' });
      dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthModalOpen', open: true } });
    }
  };

  const handleSignInSuccess = (signedInUser: User) => {
    dispatch({ type: 'SIGN_IN', payload: signedInUser });
  };

  const handleSelectTier = (newTier: 'Free' | 'Pro') => {
    dispatch({ type: 'SET_TIER', payload: newTier });
    if (user) {
      dispatch({ type: 'UPDATE_USER', payload: { ...user, plan: newTier === 'Pro' ? 'Pro' : 'Free' } });
    }
  };

  // Handle saving current fable
  const handleSaveFable = (storyboard: Storyboard) => {
    const existingIndex = savedFables.findIndex(f => f.storyboard.id === storyboard.id);
    if (existingIndex !== -1) {
      dispatch({ type: 'SET_SAVED_FABLES', payload: savedFables.filter(f => f.storyboard.id !== storyboard.id) });
    } else {
      const newEntry: SavedFable = {
        id: `saved-${Date.now()}`,
        storyboard,
        savedAt: Date.now(),
        isFavorite: true,
      };
      dispatch({ type: 'SET_SAVED_FABLES', payload: [newEntry, ...savedFables] });
    }
  };

  // Handle bookmarking scene
  const handleBookmarkScene = (scene: Scene) => {
    if (!activeStoryboard) return;

    const existingIndex = bookmarkedScenes.findIndex(
      b => b.fableId === activeStoryboard.id && b.scene.id === scene.id
    );

    if (existingIndex !== -1) {
      dispatch({ type: 'SET_BOOKMARKED_SCENES', payload: bookmarkedScenes.filter((_, idx) => idx !== existingIndex) });
    } else {
      const newBookmark: BookmarkedScene = {
        id: `bm-${Date.now()}`,
        fableId: activeStoryboard.id,
        fableTitle: activeStoryboard.title,
        scene,
        bookmarkedAt: Date.now(),
      };
      dispatch({ type: 'SET_BOOKMARKED_SCENES', payload: [newBookmark, ...bookmarkedScenes] });
    }
  };

  const handleDeleteFable = (id: string) => {
    dispatch({ type: 'SET_SAVED_FABLES', payload: savedFables.filter(f => f.id !== id) });
  };

  const handleClearLibrary = () => {
    dispatch({ type: 'SET_SAVED_FABLES', payload: [] });
  };

  const handleRemoveBookmark = (id: string) => {
    dispatch({ type: 'SET_BOOKMARKED_SCENES', payload: bookmarkedScenes.filter(b => b.id !== id) });
  };

  const scrollToCreate = () => {
    if (!user) {
      handleRequireAuth('Sign in or create an account to create your video');
      return;
    }
    dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: null });
    setTimeout(() => {
      const el = document.getElementById('create-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isCurrentFableSaved = activeStoryboard
    ? savedFables.some(f => f.storyboard.id === activeStoryboard.id)
    : false;

  const bookmarkedSceneIds = activeStoryboard
    ? bookmarkedScenes
        .filter(b => b.fableId === activeStoryboard.id)
        .map(b => b.scene.id)
    : [];

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50/70 via-pink-50/40 to-purple-50/60 text-slate-800 flex flex-col font-quicksand selection:bg-pink-200">
      {/* Cute Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-pink-100 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: null })}
            className="flex items-center gap-2 group cursor-pointer text-left"
            aria-label="Go to home"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-all">
              <Heart className="w-5 h-5 fill-white animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-lg sm:text-xl text-slate-800 tracking-tight flex items-center gap-1">
                LoveFable <span className="text-pink-500 font-cursive text-2xl font-bold">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 -mt-1 block">Animated Story Studio</span>
            </div>
          </button>

          {/* Nav Actions & View Switcher */}
          <div className="flex items-center gap-2">
            {isOffline && (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-semibold border border-amber-200">
                <WifiOff className="w-3 h-3 text-amber-600" />
                <span>Offline</span>
              </span>
            )}

            {/* View Switcher Pills */}
            <div className="p-1 rounded-full bg-slate-100 border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' });
                  dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: null });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'create' && !activeStoryboard
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create</span>
              </button>

              <button
                onClick={() => {
                  dispatch({ type: 'SET_ACTIVE_TAB', payload: 'my_stories' });
                  dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: null });
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'my_stories' && !activeStoryboard
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-pink-600'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>My Stories</span>
                <span className={`px-1.5 py-0.2 text-[10px] rounded-full font-extrabold ${
                  activeTab === 'my_stories' && !activeStoryboard
                    ? 'bg-black/20 text-white'
                    : 'bg-pink-100 text-pink-700'
                }`}>
                  {myStories.length}
                </span>
              </button>
            </div>

            <button
              onClick={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isBookmarksOpen', open: true } })}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition-all cursor-pointer relative"
              aria-label="Open saved quotes"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>Quotes</span>
              {bookmarkedScenes.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                  {bookmarkedScenes.length}
                </span>
              )}
            </button>

            {/* Auth Button or User Avatar Dropdown */}
            {user ? (
              <UserDropdown
                user={user}
                onSignOut={() => dispatch({ type: 'SIGN_OUT' })}
                onOpenProfile={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isProfileOpen', open: true } })}
                onOpenBilling={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isBillingOpen', open: true } })}
              />
            ) : (
              <button
                onClick={() => {
                  dispatch({ type: 'SET_AUTH_INTERCEPT', payload: null });
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthModalOpen', open: true } });
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-pink-700 font-bold text-xs border border-slate-200 hover:border-pink-200 transition-all cursor-pointer"
                aria-label="Sign in"
              >
                <LogIn className="w-3.5 h-3.5 text-pink-500" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto pb-16">
        <AnimatePresence mode="wait">
          {activeStoryboard ? (
            <motion.div
              key="player"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <VideoPlayer
                storyboard={activeStoryboard}
                onBookmarkScene={handleBookmarkScene}
                onSaveFable={handleSaveFable}
                isFableSaved={isCurrentFableSaved}
                bookmarkedSceneIds={bookmarkedSceneIds}
                onBackToEdit={() => dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: null })}
                tier={tier}
              />
            </motion.div>
          ) : activeTab === 'my_stories' ? (
            <motion.div
              key="my_stories_view"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              <MyStoriesView
                storyboards={myStories}
                onPlayFable={(sb) => {
                  dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: sb });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onShareFable={(sb) => dispatch({ type: 'SET_SHARE_MODAL_STORYBOARD', payload: sb })}
                onDeleteStory={(id) => dispatch({ type: 'DELETE_MY_STORY', payload: id })}
                onCreateNewClick={() => {
                  dispatch({ type: 'SET_ACTIVE_TAB', payload: 'create' });
                  dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: null });
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <HeroSection
                onStartClick={scrollToCreate}
                onExplorePresets={() => {
                  const el = document.getElementById('create-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onOpenLibrary={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isLibraryOpen', open: true } })}
                savedCount={savedFables.length}
              />

              <StoryForm
                onStoryGenerated={(sb) => {
                  dispatch({ type: 'INCREMENT_GENERATIONS' });
                  dispatch({ type: 'ADD_MY_STORY', payload: sb });
                  dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: sb });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                isOffline={isOffline}
                user={user}
                onRequireAuth={handleRequireAuth}
                tier={tier}
                generationsToday={generationsToday}
                onOpenPricing={(limitAlert) => {
                  dispatch({ type: 'SET_LIMIT_REACHED_ALERT', payload: !!limitAlert });
                  dispatch({ type: 'SET_MODAL', payload: { modal: 'isPricingOpen', open: true } });
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={!!shareModalStoryboard}
        onClose={() => dispatch({ type: 'SET_SHARE_MODAL_STORYBOARD', payload: null })}
        storyboard={shareModalStoryboard}
      />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => {
          dispatch({ type: 'SET_MODAL', payload: { modal: 'isPricingOpen', open: false } });
          dispatch({ type: 'SET_LIMIT_REACHED_ALERT', payload: false });
        }}
        currentTier={tier}
        generationsToday={generationsToday}
        onSelectTier={handleSelectTier}
        onOpenCheckout={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCheckoutOpen', open: true } })}
        limitReachedAlert={limitReachedAlert}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isCheckoutOpen', open: false } })}
        onPaymentSuccess={() => {
          dispatch({ type: 'SET_TIER', payload: 'Pro' });
          if (user) {
            dispatch({ type: 'UPDATE_USER', payload: { ...user, plan: 'Pro' } });
          }
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          dispatch({ type: 'SET_MODAL', payload: { modal: 'isAuthModalOpen', open: false } });
          dispatch({ type: 'SET_AUTH_INTERCEPT', payload: null });
        }}
        onSignInSuccess={handleSignInSuccess}
        interceptMessage={authInterceptMessage}
      />

      {user && (
        <>
          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isProfileOpen', open: false } })}
            user={user}
            onUpdateUser={(updated) => dispatch({ type: 'UPDATE_USER', payload: updated })}
          />

          <BillingModal
            isOpen={isBillingOpen}
            onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isBillingOpen', open: false } })}
            user={user}
            onUpdateUser={(updated) => dispatch({ type: 'UPDATE_USER', payload: updated })}
          />
        </>
      )}

      <LibraryModal
        isOpen={isLibraryOpen}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isLibraryOpen', open: false } })}
        savedFables={savedFables}
        onSelectFable={(sb) => {
          dispatch({ type: 'SET_ACTIVE_STORYBOARD', payload: sb });
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDeleteFable={handleDeleteFable}
        onClearLibrary={handleClearLibrary}
      />

      <BookmarkedScenesModal
        isOpen={isBookmarksOpen}
        onClose={() => dispatch({ type: 'SET_MODAL', payload: { modal: 'isBookmarksOpen', open: false } })}
        bookmarkedScenes={bookmarkedScenes}
        onRemoveBookmark={handleRemoveBookmark}
      />

      <Footer />
    </div>
  );
}
