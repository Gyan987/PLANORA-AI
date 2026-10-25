import {
  Bookmark,
  BookmarkCheck,
  Check,
  Filter,
  Lightbulb,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import React, { useState } from 'react';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { EventIdea } from '../types';

const CATEGORIES = [
  'All',
  'Decoration',
  'Menu',
  'Entertainment',
  'Return Gifts',
  'Sustainable Planning',
  'Guest Activities'
];

export const IdeasPage: React.FC = () => {
  const { activeEvent, saveIdeaToPlan } = useEventContext();

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [ideas, setIdeas] = useState<EventIdea[]>(() => activeEvent?.ideas || []);
  const [isLoading, setIsLoading] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  if (!activeEvent) return null;

  const filteredIdeas = ideas.filter((idea) => {
    if (selectedCategory === 'All') return true;
    return idea.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  const handleFetchMoreIdeas = async () => {
    setIsLoading(true);
    try {
      const newIdeas = await api.getIdeas({
        eventType: activeEvent.type,
        culturalTradition: activeEvent.culturalTradition,
        theme: activeEvent.theme,
        city: activeEvent.city,
        guests: activeEvent.guests,
        totalBudget: activeEvent.totalBudget,
        category: selectedCategory !== 'All' ? selectedCategory : undefined
      });

      // Merge unique
      const existingTitles = new Set(ideas.map((i) => i.title));
      const filtered = newIdeas.filter((i) => !existingTitles.has(i.title));
      setIdeas((prev) => [...filtered, ...prev]);
    } catch (err) {
      console.error('Fetch ideas error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = (idea: EventIdea) => {
    saveIdeaToPlan(idea);
    setIdeas((prev) =>
      prev.map((i) => (i.id === idea.id ? { ...i, saved: true } : i))
    );
    setSavedFeedback(idea.title);
    setTimeout(() => setSavedFeedback(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Personalized AI Ideas & Inspiration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Culturally tailored themes, authentic menus, bespoke decor, and sustainable suggestions.
          </p>
        </div>

        <button
          onClick={handleFetchMoreIdeas}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate More with Gemini
        </button>
      </div>

      {/* Saved Toast Feedback */}
      {savedFeedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-bold text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4 text-emerald-600" />
          <span>"{savedFeedback}" saved to your active event blueprint!</span>
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-soft-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIdeas.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            No ideas in this category yet. Click "Generate More with Gemini" to fetch tailored inspirations.
          </div>
        ) : (
          filteredIdeas.map((idea) => {
            const isSaved = idea.saved;

            return (
              <div
                key={idea.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between transition hover:shadow-soft-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-900/60">
                      {idea.category}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                      {idea.estimatedCostRange}
                      <span className="text-[9px] font-normal text-slate-400 block text-right">
                        illustrative
                      </span>
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                    {idea.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {idea.description}
                  </p>

                  <div className="mt-3 inline-block rounded-lg bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-500">
                    <strong className="text-slate-700 dark:text-slate-300">Best for:</strong> {idea.suitability}
                  </div>

                  {idea.implementationTips && idea.implementationTips.length > 0 && (
                    <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Implementation Tips
                      </p>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {idea.implementationTips.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-brand-600 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => handleSave(idea)}
                    className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
                      isSaved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-soft-sm'
                    }`}
                  >
                    {isSaved ? (
                      <>
                        <BookmarkCheck className="h-3.5 w-3.5" />
                        Saved in Plan
                      </>
                    ) : (
                      <>
                        <Bookmark className="h-3.5 w-3.5" />
                        Save to Plan
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
