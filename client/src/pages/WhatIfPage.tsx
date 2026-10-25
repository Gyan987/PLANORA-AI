import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Loader2,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { WhatIfSimulationResult } from '../types';
import { formatINR } from '../utils/currency';

export const WhatIfPage: React.FC = () => {
  const { activeEvent, applySimulation } = useEventContext();

  const [simBudget, setSimBudget] = useState<number>(activeEvent?.totalBudget || 500000);
  const [simGuests, setSimGuests] = useState<number>(activeEvent?.guests || 200);
  const [simDuration, setSimDuration] = useState<number>(activeEvent?.durationHours || 8);
  const [simSetting, setSimSetting] = useState<'Indoor' | 'Outdoor' | 'Hybrid'>(activeEvent?.indoorOutdoor || 'Hybrid');

  const [isLoading, setIsLoading] = useState(false);
  const [simResult, setSimResult] = useState<WhatIfSimulationResult | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!activeEvent) return null;

  const handleRunSimulation = async () => {
    setIsLoading(true);
    setAppliedSuccess(false);

    try {
      const res = await api.simulateWhatIf(activeEvent, {
        totalBudget: simBudget,
        guests: simGuests,
        durationHours: simDuration,
        indoorOutdoor: simSetting
      });
      setSimResult(res);
    } catch (err: any) {
      console.error('Simulation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToEvent = () => {
    if (simResult && simResult.proposedCategories) {
      applySimulation(simBudget, simGuests, simResult.proposedCategories, {
        durationHours: simDuration,
        indoorOutdoor: simSetting
      });
      setAppliedSuccess(true);
    }
  };

  const handleReset = () => {
    setSimBudget(activeEvent.totalBudget);
    setSimGuests(activeEvent.guests);
    setSimDuration(activeEvent.durationHours || 8);
    setSimSetting(activeEvent.indoorOutdoor);
    setSimResult(null);
    setAppliedSuccess(false);
  };

  const originalCostPerGuest = activeEvent.guests > 0 ? Math.round(activeEvent.totalBudget / activeEvent.guests) : 0;
  const proposedCostPerGuest = simGuests > 0 ? Math.round(simBudget / simGuests) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 px-3 py-0.5 text-xs font-bold dark:bg-violet-950 dark:text-violet-300 mb-2">
            <Sliders className="h-3.5 w-3.5" />
            <span>Signature Predictive Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            What-If Event Simulator
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate changes in guest scale, budget caps, and setting without modifying your active plan.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Parameters
        </button>
      </div>

      {/* Interactive Controls Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-6 uppercase tracking-wider">
          Simulation Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Guest Count Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Simulated Guests</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold text-sm">
                {simGuests} Guests
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="10"
              value={simGuests}
              onChange={(e) => setSimGuests(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Intimate (20)</span>
              <span>Original: {activeEvent.guests}</span>
              <span>Grand Gala (1000)</span>
            </div>
          </div>

          {/* Budget Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Simulated Total Budget</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold text-sm">
                {formatINR(simBudget)}
              </span>
            </div>
            <input
              type="range"
              min="10000"
              max="2500000"
              step="25000"
              value={simBudget}
              onChange={(e) => setSimBudget(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>₹10,000</span>
              <span>Original: {formatINR(activeEvent.totalBudget)}</span>
              <span>₹25,00,000</span>
            </div>
          </div>

          {/* Duration Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-slate-700 dark:text-slate-300">Celebration Duration</span>
              <span className="text-brand-600 dark:text-brand-400 font-extrabold text-sm">
                {simDuration} Hours
              </span>
            </div>
            <input
              type="range"
              min="3"
              max="24"
              step="1"
              value={simDuration}
              onChange={(e) => setSimDuration(parseInt(e.target.value))}
              className="w-full accent-brand-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Half-day (3 hrs)</span>
              <span>Original: {activeEvent.durationHours || 8} hrs</span>
              <span>Full Day (24 hrs)</span>
            </div>
          </div>

          {/* Setting Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Setting Preference</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Indoor', 'Outdoor', 'Hybrid'] as const).map((setting) => (
                <button
                  key={setting}
                  type="button"
                  onClick={() => setSimSetting(setting)}
                  className={`rounded-xl py-2 text-xs font-bold transition border ${
                    simSetting === setting
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {setting}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleRunSimulation}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-soft-md hover:opacity-95 transition"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Calculate What-If Impacts
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Baseline Plan Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Baseline Active Plan</span>
            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600">Locked</span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Total Budget:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{formatINR(activeEvent.totalBudget)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Guest Count:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">{activeEvent.guests} Attendees</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Cost per Guest:</span>
              <span className="font-extrabold text-indigo-600">{formatINR(originalCostPerGuest)} / guest</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Setting:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activeEvent.indoorOutdoor}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Duration:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{activeEvent.durationHours || 8} Hours</span>
            </div>
          </div>
        </div>

        {/* Proposed Simulated Scenario Card */}
        <div className="rounded-3xl border-2 border-violet-400/40 bg-gradient-to-br from-violet-50/40 to-brand-50/40 p-6 shadow-soft-sm dark:border-violet-900/60 dark:from-violet-950/20 dark:to-brand-950/20">
          <div className="flex items-center justify-between border-b border-violet-200/50 pb-3 dark:border-violet-900/40">
            <span className="text-xs font-bold uppercase tracking-wider text-violet-700 dark:text-violet-300">
              Simulated Scenario
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                simResult?.budgetImpact.feasibility === 'Deficit'
                  ? 'bg-rose-100 text-rose-700'
                  : simResult?.budgetImpact.feasibility === 'Tight'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              Feasibility: {simResult?.budgetImpact.feasibility || 'Pending Analysis'}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Total Budget:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {formatINR(simBudget)} ({simBudget - activeEvent.totalBudget >= 0 ? '+' : ''}{formatINR(simBudget - activeEvent.totalBudget)})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Guest Count:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">
                {simGuests} Attendees ({simGuests - activeEvent.guests >= 0 ? '+' : ''}{simGuests - activeEvent.guests})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Cost per Guest:</span>
              <span className="font-extrabold text-violet-600 dark:text-violet-400">
                {formatINR(proposedCostPerGuest)} / guest ({proposedCostPerGuest - originalCostPerGuest >= 0 ? '+' : ''}{formatINR(proposedCostPerGuest - originalCostPerGuest)})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Setting:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{simSetting}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400">Duration:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{simDuration} Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Results Analysis (When Generated) */}
      {simResult && (
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-soft-xl dark:border-slate-800 dark:bg-slate-900 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">AI Trade-Off Analysis</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{simResult.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Vendor & Schedule Impacts */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-brand-600" />
                Operational & Vendor Impacts:
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                {simResult.scheduleAndVendorImpacts.map((imp, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-brand-600">•</span>
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Strategic Trade-offs */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <h4 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Scale className="h-4 w-4 text-amber-500" />
                Key Trade-Offs & Adjustments:
              </h4>
              <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                {simResult.tradeOffs.map((to, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-amber-500">•</span>
                    <span>{to}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations */}
          {simResult.actionableRecommendations.length > 0 && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20 text-xs">
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Recommended Actions Before Committing:
              </h4>
              <ul className="list-disc list-inside text-emerald-800 dark:text-emerald-300 space-y-1 mt-2">
                {simResult.actionableRecommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Apply or Discard Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500">
              Applying this simulation will update your active event's budget caps and category targets.
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50"
              >
                Discard Simulation
              </button>

              <button
                type="button"
                onClick={handleApplyToEvent}
                className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
              >
                Apply Simulation to Active Plan
              </button>
            </div>
          </div>

          {appliedSuccess && (
            <div className="rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 p-3 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Simulation successfully applied! Your budget and guest scale have been updated.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
