import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Sparkles,
  Bookmark,
  History as HistoryIcon,
  LogOut,
  LogIn,
  UserPlus,
  User,
} from 'lucide-react';

const Navbar = ({ onOpenAiModal }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo: Nearby */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <MapPin className="w-5 h-5 text-white fill-current" />
            </div>
            <div className="flex items-center">
              <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-slate-900">
                Nearby<span className="text-blue-600 font-black">AI</span>
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            {/* AI Assistant Quick Trigger */}
            <button
              type="button"
              onClick={onOpenAiModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/70 transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
              <span>Ask AI</span>
            </button>

            {user && (
              <>
                <Link
                  to="/favorites"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive('/favorites')
                      ? 'bg-blue-50 text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span className="hidden md:inline">Favorites</span>
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    isActive('/history')
                      ? 'bg-blue-50 text-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  <HistoryIcon className="w-4 h-4" />
                  <span className="hidden md:inline">History</span>
                </Link>
              </>
            )}
          </nav>

          {/* User Auth Controls: Separate /login and /register Routes */}
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl py-1 px-2.5">
                <div className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-xs">
                  {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-xs font-bold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 truncate max-w-[130px]">{user.email}</span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-100/80 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 active:scale-98 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
