import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  Loader2,
  MapPin,
  PartyPopper,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { EventPlan, EventType } from '../types';
import { formatINR } from '../utils/currency';

interface FormData {
  type: EventType;
  name: string;
  date: string;
  city: string;
  guests: number;
  totalBudget: number;
  durationHours: number;
  language: string;
  indoorOutdoor: 'Indoor' | 'Outdoor' | 'Hybrid';
  theme: string;
  culturalTradition: string;
  foodPreference: string;
  decorationStyle: string;
  entertainmentPreference: string;
  accessibilityRequirements: string;
  topPriorities: string[];
  userPrompt: string;
}

const EVENT_TYPES: Array<{ type: EventType; label: string; icon: any; desc: string }> = [
  { type: 'wedding', label: 'Wedding & Reception', icon: Heart, desc: 'Sacred ceremonies, multi-day celebrations, and festive banquets' },
  { type: 'birthday', label: 'Birthday Celebration', icon: PartyPopper, desc: 'Milestones, kids themed parties, and lively family gatherings' },
  { type: 'community', label: 'Community & Cultural Event', icon: Users, desc: 'Festivals, pujas, cultural evenings, and public gatherings' },
  { type: 'anniversary', label: 'Anniversary Celebration', icon: Calendar, desc: 'Silver, golden, or milestone romantic anniversaries' },
  { type: 'corporate', label: 'Corporate & Conference', icon: Clock, desc: 'Professional summits, gala dinners, and team conventions' },
  { type: 'custom', label: 'Custom Celebration', icon: Sparkles, desc: 'Housewarmings, reunions, and bespoke private events' },
];

export const WizardPage: React.FC = () => {
  const { saveNewPlan } = useEventContext();
  const navigate = useNavigate();

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    type: 'wedding',
    name: 'Bengali Heritage Wedding',
    date: '2026-11-28',
    city: 'Kolkata',
    guests: 200,
    totalBudget: 500000,
    durationHours: 8,
    language: 'English & Bengali',
    indoorOutdoor: 'Hybrid',
    theme: 'Traditional Rajbari Heritage',
    culturalTradition: 'Traditional Bengali Hindu Wedding (Biye & Bor Jatri)',
    foodPreference: 'Authentic Bengali Bhoj (Bhetki Paturi, Kosha Mangsho, Nolen Gur Sandesh)',
    decorationStyle: 'Shola Crafts, Red-White Floral Mandap, Brass Bells',
    entertainmentPreference: 'Dhak beats, Shehnai morning welcome & evening Rabindra Sangeet fusion',
    accessibilityRequirements: 'Wheelchair access at banquet and elderly seating',
    topPriorities: ['Cuisine Quality', 'Photographic Memories', 'Smooth Bor Jatri Welcome'],
    userPrompt: 'I want a traditional Bengali wedding in Kolkata for 200 guests with a budget of ₹5 lakh. I prefer elegant floral decorations, authentic Bengali cuisine, and a two-day celebration.'
  });

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [generatedPlan, setGeneratedPlan] = useState<EventPlan | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      generatePlanWithAI();
    }
  };

  const handlePrev = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const generatePlanWithAI = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStage('Connecting to Gemini 3.8 Flash SDK...');

    try {
      setTimeout(() => setGenerationStage('Analyzing cultural traditions & guest scale...'), 600);
      setTimeout(() => setGenerationStage('Computing deterministic budget allocations across 8 categories...'), 1200);
      setTimeout(() => setGenerationStage('Generating realistic preparation timeline and day-of schedule...'), 1800);
      setTimeout(() => setGenerationStage('Curating vendor requirements and risk assessment...'), 2400);

      const plan = await api.generatePlan(formData);
      setGeneratedPlan(plan);
      setStep(5);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      console.error('Error generating plan:', err);
      setErrorMsg(err.message || 'Failed to generate plan. Please verify network connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (generatedPlan) {
      saveNewPlan(generatedPlan);
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 dark:bg-[#090D16] dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Planora AI Creation Wizard</span>
          </div>
        </div>

        {/* Multi-step progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
            <span className={step >= 1 ? 'text-brand-600 dark:text-brand-400' : ''}>1. Event Type</span>
            <span className={step >= 2 ? 'text-brand-600 dark:text-brand-400' : ''}>2. Details</span>
            <span className={step >= 3 ? 'text-brand-600 dark:text-brand-400' : ''}>3. Preferences</span>
            <span className={step >= 4 ? 'text-brand-600 dark:text-brand-400' : ''}>4. AI Description</span>
            <span className={step === 5 ? 'text-brand-600 dark:text-brand-400' : ''}>5. Review Plan</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-violet-600 transition-all duration-300"
              style={{ width: `${(step / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Wizard Form Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-10 shadow-soft-xl dark:border-slate-800 dark:bg-slate-900">
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: Event Type */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">What kind of event are you planning?</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select the category that best matches your celebration style.</p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {EVENT_TYPES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.type === item.type;
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: item.type })}
                      className={`text-left rounded-2xl border p-5 transition relative ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/50 dark:border-brand-500 dark:bg-brand-950/30 ring-2 ring-brand-500/20'
                          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-4 right-4 h-5 w-5 rounded-full bg-brand-600 text-white flex items-center justify-center text-[10px]">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${
                        isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: Event Details */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Key Event Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Establish the core logistics and budget parameters.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ananya & Sourav's Wedding"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">City / Location</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Kolkata, Mumbai, Delhi, Bengaluru"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Number of Guests</label>
                  <input
                    type="number"
                    min="5"
                    max="10000"
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Total Budget (INR) — <span className="text-brand-600 dark:text-brand-400">{formatINR(formData.totalBudget)}</span>
                  </label>
                  <input
                    type="number"
                    step="5000"
                    min="10000"
                    value={formData.totalBudget}
                    onChange={(e) => setFormData({ ...formData, totalBudget: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Indoor / Outdoor Preference</label>
                  <select
                    value={formData.indoorOutdoor}
                    onChange={(e) => setFormData({ ...formData, indoorOutdoor: e.target.value as any })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="Indoor">Indoor Banquet / Hall</option>
                    <option value="Outdoor">Outdoor Lawn / Open-air</option>
                    <option value="Hybrid">Hybrid (Indoor Hall + Outdoor Lawn)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: parseInt(e.target.value) || 6 })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Preferred Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="e.g. English, Hindi, Bengali"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Preferences */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Cultural & Aesthetic Preferences</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personalize traditions, cuisine, decor, and entertainment.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cultural Tradition / Rituals</label>
                  <input
                    type="text"
                    value={formData.culturalTradition}
                    onChange={(e) => setFormData({ ...formData, culturalTradition: e.target.value })}
                    placeholder="e.g. Bengali Biye, Punjabi Sangeet, South Indian Muhurtham"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Theme / Aesthetic Motif</label>
                  <input
                    type="text"
                    value={formData.theme}
                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="e.g. Heritage Rajbari, Minimalist Botanical, Royal Mughal"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Food Preferences & Menu Style</label>
                  <input
                    type="text"
                    value={formData.foodPreference}
                    onChange={(e) => setFormData({ ...formData, foodPreference: e.target.value })}
                    placeholder="e.g. Authentic Bengali Bhoj, Multi-cuisine Live Counters"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Decoration Style</label>
                  <input
                    type="text"
                    value={formData.decorationStyle}
                    onChange={(e) => setFormData({ ...formData, decorationStyle: e.target.value })}
                    placeholder="e.g. Sholapith crafts, Rajnigandha tuberose, warm ambient fairy lights"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Entertainment & Music</label>
                  <input
                    type="text"
                    value={formData.entertainmentPreference}
                    onChange={(e) => setFormData({ ...formData, entertainmentPreference: e.target.value })}
                    placeholder="e.g. Dhak drums, Shehnai, live acoustic band, DJ"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Accessibility / Special Needs</label>
                  <input
                    type="text"
                    value={formData.accessibilityRequirements}
                    onChange={(e) => setFormData({ ...formData, accessibilityRequirements: e.target.value })}
                    placeholder="e.g. Wheelchair ramp, priority seating for grandparents"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI Description & Prompt */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Describe Your Dream Celebration</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Share your vision in your own words. Gemini 3.8 Flash will weave every detail into your complete event blueprint.
                </p>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={formData.userPrompt}
                  onChange={(e) => setFormData({ ...formData, userPrompt: e.target.value })}
                  placeholder="Describe your celebration in natural language..."
                  className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 focus:border-brand-600 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white leading-relaxed"
                />
              </div>

              {/* Inspiration Chips */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Example Vision Prompts</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Traditional Bengali wedding in Kolkata for 200 guests with ₹5 lakh budget, elegant floral decor, authentic Bengali cuisine, and 2-day celebration',
                    'Superhero-themed 7th birthday in Mumbai for 30 kids with magic show, fun games, and superhero cape favors under ₹25,000',
                    'Community cultural evening in Kolkata with dhak beats, staging, prasad distribution, and volunteer safety'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setFormData({ ...formData, userPrompt: chip })}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] text-slate-700 hover:border-brand-400 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 text-left transition"
                    >
                      "{chip.substring(0, 75)}..."
                    </button>
                  ))}
                </div>
              </div>

              {isGenerating && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50/80 p-6 dark:border-brand-900 dark:bg-brand-950/40 text-center animate-pulse">
                  <Loader2 className="h-8 w-8 text-brand-600 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-bold text-brand-950 dark:text-brand-200">
                    {generationStage || 'Crafting your personalized celebration plan...'}
                  </p>
                  <p className="text-xs text-brand-700 dark:text-brand-400 mt-1">
                    Google Gemini 3.8 Flash is calculating budgets, timelines, and vendor requirements.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Generated Plan Review */}
          {step === 5 && generatedPlan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 px-3 py-0.5 text-xs font-bold dark:bg-emerald-950 dark:text-emerald-300 mb-2">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Plan Generated Successfully</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{generatedPlan.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {generatedPlan.city} • {generatedPlan.guests} Guests • {formatINR(generatedPlan.totalBudget)} Budget
                  </p>
                </div>
                <button
                  onClick={handleConfirmAndSave}
                  className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-soft-md hover:opacity-95 transition"
                >
                  Save & Open Dashboard →
                </button>
              </div>

              {/* Overview Summary */}
              <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2">Executive Summary</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{generatedPlan.overviewSummary}</p>
              </div>

              {/* Budget Allocation Preview */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                  Budget Allocations ({generatedPlan.budgetCategories.length} Categories)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {generatedPlan.budgetCategories.map((cat) => (
                    <div key={cat.id} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</div>
                        <div className="text-[10px] text-slate-400">{cat.notes}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900 dark:text-white">{formatINR(cat.allocatedAmount)}</div>
                        <div className="text-[10px] text-emerald-600 font-medium">{cat.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Vendor & Timeline Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2">Preparation Timeline ({generatedPlan.tasks.length} Milestones)</h5>
                  <ul className="space-y-2">
                    {generatedPlan.tasks.slice(0, 3).map((t) => (
                      <li key={t.id} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="truncate mr-2">• {t.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{t.dueDate}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800">
                  <h5 className="font-bold text-slate-900 dark:text-white mb-2">Vendors to Engage ({generatedPlan.vendors.length} Categories)</h5>
                  <ul className="space-y-2">
                    {generatedPlan.vendors.slice(0, 3).map((v) => (
                      <li key={v.id} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                        <span className="truncate mr-2">• {v.category} ({v.name})</span>
                        <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 shrink-0">{formatINR(v.estimatedPrice)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          {step < 5 && (
            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 1 || isGenerating}
                className={`rounded-xl border px-5 py-2.5 text-xs font-semibold transition ${
                  step === 1
                    ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                Previous Step
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={isGenerating}
                className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition disabled:opacity-50"
              >
                {step === 4 ? (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Plan with Gemini
                  </>
                ) : (
                  <>
                    Next Step
                    <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="mt-8 flex items-center justify-end border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-8 py-3 text-xs font-bold text-white shadow-soft-lg hover:opacity-95 transition"
              >
                Confirm & Open Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
