import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, CreditCard, LogOut, ChevronDown } from 'lucide-react';
import { User } from '../types';

interface UserDropdownProps {
  user: User;
  onSignOut: () => void;
  onOpenProfile: () => void;
  onOpenBilling: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  user,
  onSignOut,
  onOpenProfile,
  onOpenBilling,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get user initials
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar + Name Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-50 hover:bg-rose-50 border border-pink-200/80 transition-all cursor-pointer shadow-xs group"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-pink-300"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {initials}
          </div>
        )}

        <div className="text-left hidden sm:block">
          <div className="text-xs font-bold text-slate-800 leading-none group-hover:text-pink-600 transition-colors">
            {user.name}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            <span>{user.plan}</span>
          </div>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-pink-100 py-2 z-50 overflow-hidden"
          >
            {/* Header section in dropdown */}
            <div className="px-4 py-3 bg-rose-50/60 border-b border-pink-100">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
              <div className="mt-2 flex items-center justify-between text-[10px] font-semibold">
                <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  {user.plan} Tier
                </span>
                <span className="text-slate-500">{user.credits} Video Credits</span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-1 space-y-0.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left cursor-pointer"
              >
                <UserIcon className="w-4 h-4 text-pink-500" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onOpenBilling();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-pink-50 hover:text-pink-700 transition-colors text-left cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-purple-500" />
                <span>Billing</span>
              </button>

              <div className="my-1 border-t border-slate-100"></div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
