import { Sparkles } from 'lucide-react';
import React from 'react';

export const PageLoadingFallback: React.FC = () => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading module"
      className="flex min-h-[350px] w-full flex-col items-center justify-center p-8 text-center animate-pulse"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 text-white shadow-soft-md animate-spin-slow">
        <Sparkles className="h-6 w-6 animate-pulse" />
      </div>
      <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
        Loading celebration module...
      </p>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};
