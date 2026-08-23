import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-current" />
              </div>
              <h2 className="text-xl font-bold font-quicksand text-slate-800">
                LoveFable <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-dancing text-2xl font-normal tracking-wide">AI</span>
              </h2>
            </div>
            <p className="text-sm text-slate-500 max-w-sm">
              Turn your personal messages, quiet thanks, and loving memories into beautiful, word-by-word animated stories.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Features</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-pink-500 transition-colors">AI Generation</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">HD Exports</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Custom Moods</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><a href="#" className="hover:text-pink-500 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-pink-500 transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} LoveFable AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            Made with <Heart className="w-3 h-3 text-rose-500 mx-1 fill-current" /> for storytelling
          </div>
        </div>
      </div>
    </footer>
  );
};
