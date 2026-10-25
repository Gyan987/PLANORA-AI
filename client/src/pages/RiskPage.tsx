import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { EventRisk } from '../types';

export const RiskPage: React.FC = () => {
  const { activeEvent, updateActiveEvent } = useEventContext();

  const [isLoading, setIsLoading] = useState(false);
  const [risks, setRisks] = useState<EventRisk[]>(() => activeEvent?.risks || []);

  if (!activeEvent) return null;

  const handleRefreshRisks = async () => {
    setIsLoading(true);
    try {
      const refreshed = await api.analyzeRisks(activeEvent);
      setRisks(refreshed);
      updateActiveEvent({ risks: refreshed });
    } catch (err) {
      console.error('Risk analysis error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const criticalCount = risks.filter((r) => r.severity === 'Critical').length;
  const highCount = risks.filter((r) => r.severity === 'High').length;
  const mediumCount = risks.filter((r) => r.severity === 'Medium').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            AI Event Risk Analyzer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Predictive vulnerability scanning for weather, curfew compliance, vendor delays, and emergency reserves.
          </p>
        </div>

        <button
          onClick={handleRefreshRisks}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Re-Analyze Event Risks
        </button>
      </div>

      {/* Risk Severity Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Monitored Risks</span>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{risks.length}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">Across logistics & finance</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4 shadow-soft-sm dark:border-rose-900/40 dark:bg-rose-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Critical Risks</span>
          <p className="text-2xl font-extrabold text-rose-700 dark:text-rose-300 mt-1">{criticalCount}</p>
          <p className="text-[10px] text-rose-600/80 mt-0.5">Require immediate intervention</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-4 shadow-soft-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">High Risks</span>
          <p className="text-2xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">{highCount}</p>
          <p className="text-[10px] text-amber-600/80 mt-0.5">Strict timeline deadlines</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/60 p-4 shadow-soft-sm dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">Moderate / Monitored</span>
          <p className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-300 mt-1">{mediumCount}</p>
          <p className="text-[10px] text-indigo-600/80 mt-0.5">Covered by standard contingency</p>
        </div>
      </div>

      {/* Risks Detailed Cards */}
      <div className="space-y-4">
        {risks.map((risk) => {
          const isCritical = risk.severity === 'Critical';
          const isHigh = risk.severity === 'High';

          return (
            <div
              key={risk.id}
              className={`rounded-3xl border p-6 shadow-soft-sm transition ${
                isCritical
                  ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/50 dark:bg-rose-950/20'
                  : isHigh
                  ? 'border-amber-300 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20'
                  : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  {isCritical ? (
                    <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0" />
                  ) : isHigh ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  ) : (
                    <Shield className="h-5 w-5 text-indigo-500 shrink-0" />
                  )}
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {risk.description}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                      isCritical
                        ? 'bg-rose-600 text-white'
                        : isHigh
                        ? 'bg-amber-500 text-white'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {risk.severity} Severity
                  </span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {risk.deadline}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Root Cause / Vulnerability:</span>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{risk.reason}</p>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                  <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Recommended Mitigation Action:
                  </span>
                  <p className="text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                    {risk.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
