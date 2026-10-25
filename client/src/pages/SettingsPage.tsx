import {
  Check,
  CheckCircle2,
  Database,
  Moon,
  RotateCcw,
  Sparkles,
  Sun,
  Trash2,
  User,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { SAMPLE_EVENTS, storage } from '../services/storage';
import { EventPlan } from '../types';

export const SettingsPage: React.FC = () => {
  const { user, setUser, theme, toggleTheme, activeEvent, deleteEvent, selectEvent } = useEventContext();
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || 'Priya Sharma');
  const [email, setEmail] = useState(user?.email || 'priya.sharma@planora.ai');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({ name, email });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLoadScenario = (scenario: EventPlan) => {
    storage.saveEvent(scenario);
    selectEvent(scenario.id);
    navigate('/dashboard');
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all saved events back to default demonstration blueprints?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Application Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your planner profile, evaluation demo datasets, and theme preferences.
        </p>
      </div>

      {saveSuccess && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      {/* User Profile Form */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Planner Profile</h3>
            <p className="text-xs text-slate-500">Your details for event plans and exported PDF reports</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2 text-xs font-bold hover:opacity-90 transition"
            >
              Update Profile
            </button>
          </div>
        </form>
      </div>

      {/* Instant Hackathon Scenarios Picker */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Evaluation Scenarios</h3>
            <p className="text-xs text-slate-500">Instantly test the platform with realistic pre-configured event blueprints</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SAMPLE_EVENTS.map((sample) => (
            <div
              key={sample.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-600 dark:text-brand-400">
                  {sample.type} • {sample.city}
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1">
                  {sample.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Budget: ₹{sample.totalBudget.toLocaleString('en-IN')} • {sample.guests} Guests
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                <button
                  onClick={() => handleLoadScenario(sample)}
                  className="rounded-xl bg-brand-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-brand-700 transition"
                >
                  Load Scenario →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-3xl border border-rose-200 bg-rose-50/30 p-6 sm:p-8 dark:border-rose-900/40 dark:bg-rose-950/10">
        <h3 className="text-sm font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider mb-2">
          Data Management
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
          Reset all locally saved plans back to initial factory demo benchmarks.
        </p>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset to Factory Demonstration Plans
        </button>
      </div>
    </div>
  );
};
