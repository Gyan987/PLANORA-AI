import {
  Calendar,
  Clock,
  LogOut,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  User as UserIcon
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEventContext } from '../../context/EventContext';
import { calculateDaysRemaining } from '../../utils/currency';

export const Navbar: React.FC = () => {
  const { events, activeEvent, selectEvent, theme, toggleTheme, user, setUser } = useEventContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const daysLeft = activeEvent ? calculateDaysRemaining(activeEvent.date) : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#090D16]/90 transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Active Event Picker */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 text-white shadow-soft-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Planora</span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/70 px-1.5 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">Your Celebration. Our Intelligence.</p>
            </div>
          </Link>

          {/* Event Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 transition"
              title="Switch Event"
            >
              <Calendar className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
              <span className="max-w-[140px] truncate sm:max-w-[200px]">
                {activeEvent ? activeEvent.name : 'Select Event'}
              </span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-soft-xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Your Saved Events
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {events.map((evt) => (
                    <button
                      key={evt.id}
                      onClick={() => {
                        selectEvent(evt.id);
                        setDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                        activeEvent?.id === evt.id
                          ? 'bg-brand-50 text-brand-700 font-semibold dark:bg-brand-950 dark:text-brand-300'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="truncate mr-2">
                        <div className="font-medium truncate">{evt.name}</div>
                        <div className="text-[10px] text-slate-400">{evt.city} • {evt.type}</div>
                      </div>
                      {activeEvent?.id === evt.id && (
                        <span className="h-2 w-2 rounded-full bg-brand-600"></span>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-2 border-t border-slate-100 pt-2 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate('/create');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white hover:bg-brand-700 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create New Event
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          {/* Live Countdown Badge */}
          {activeEvent && (
            <div className="hidden md:flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50/70 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">
              <Clock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>
                {daysLeft > 0 ? `${daysLeft} days to celebration` : daysLeft === 0 ? 'Today is the day!' : `${Math.abs(daysLeft)} days ago`}
              </span>
            </div>
          )}

          {/* Create Event CTA */}
          <Link
            to="/create"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-violet-600 px-3 py-1.5 text-xs font-semibold text-white shadow-soft-sm hover:opacity-95 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            New Event
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 rounded-full border border-slate-200 p-1 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 transition"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-tr from-brand-500 to-violet-500 text-xs font-bold text-white">
                {user ? user.name[0] : 'U'}
              </div>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-soft-xl dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white">{user?.name || 'Guest Planner'}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'guest@planora.ai'}</p>
                </div>
                <div className="pt-1">
                  <Link
                    to="/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                  >
                    <UserIcon className="h-3.5 w-3.5" />
                    Account Settings
                  </Link>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      setUser(null);
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
