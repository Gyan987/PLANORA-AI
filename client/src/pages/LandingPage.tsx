import {
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Heart,
  HelpCircle,
  Lightbulb,
  PartyPopper,
  ShieldCheck,
  Sliders,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useEventContext } from '../context/EventContext';
import { SAMPLE_EVENTS } from '../services/storage';
import { formatINR } from '../utils/currency';

export const LandingPage: React.FC = () => {
  const { selectEvent } = useEventContext();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleLoadSample = (sampleId: string) => {
    selectEvent(sampleId);
    navigate('/dashboard');
  };

  const FAQS = [
    {
      q: 'How does Planora AI generate realistic event budgets?',
      a: 'Planora AI uses Google Gemini along with deterministic domain financial models. It divides your total budget across real categories like venue, catering, decor, and emergency reserve based on guest count, city, and event type. All financial calculations, percentages, and totals are computed deterministically in code so numbers always add up accurately.'
    },
    {
      q: 'Does Planora AI support Indian wedding traditions and regional customs?',
      a: 'Yes! Planora AI includes deep cultural understanding of Indian celebrations, such as traditional Bengali weddings (Gaye Holud, Bor Jatri, Shola decor, Bhetki Paturi feast), North & South Indian customs, and regional community festivals like Durga Puja and Diwali.'
    },
    {
      q: 'What is the "What-If Event Simulator"?',
      a: 'The What-If Simulator allows you to experiment with shifting parameters—such as increasing guests from 150 to 250 or adjusting your total budget—without modifying your saved plan. It models the impact on cost-per-guest, catering scalability, and vendor schedules, allowing you to preview trade-offs before deciding to apply or discard changes.'
    },
    {
      q: 'What happens if my planned spending exceeds my budget?',
      a: 'Planora AI features an intelligent "Budget Rescue" auditor. If your projected spending exceeds your available budget, the system calculates the exact overage and suggests concrete trade-offs (e.g. optimizing appetizer counters or choosing seasonal florals) to bring expenses back into balance with your explicit approval.'
    },
    {
      q: 'Can I export my plan for vendors and family members?',
      a: 'Yes, you can generate and download a clean, multi-page professional PDF plan complete with itemized budget tables, preparation milestones, vendor checklists, event-day schedule, and risk mitigation steps formatted with Indian Rupee currency.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 dark:bg-[#090D16] dark:text-slate-100 transition-colors">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-[#090D16]/85">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-violet-500 text-white shadow-soft-md shadow-brand-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Planora</span>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/70 px-1.5 py-0.5 rounded-md border border-brand-200 dark:border-brand-800">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Your Celebration. Our Intelligence.</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleLoadSample('sample-bengali-wedding')}
              className="text-xs font-semibold text-slate-600 hover:text-brand-600 dark:text-slate-300 dark:hover:text-brand-400 hidden sm:block px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Quick Demo: Kolkata Wedding
            </button>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              Dashboard
            </Link>
            <Link
              to="/create"
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white shadow-soft-sm hover:opacity-95 transition"
            >
              Start Planning
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(9,13,22,0))]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3.5 py-1 text-xs font-semibold text-brand-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-brand-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
            <span>Powered by Google Gemini 3.8 Flash SDK</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Every Great Celebration Starts With a Great Plan.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            From intimate birthdays to grand weddings, let AI handle the planning while you enjoy the moments that matter.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/create"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-soft-lg hover:shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition"
            >
              Start Planning for Free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#how-it-works"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 shadow-soft-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition"
            >
              Explore Features
            </a>

            <button
              onClick={() => handleLoadSample('sample-bengali-wedding')}
              className="rounded-xl border border-brand-200 bg-brand-50/70 px-6 py-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-100 dark:border-brand-900 dark:bg-brand-950/50 dark:text-brand-300 transition"
            >
              ⚡ Explore Sample Plan (₹5L Wedding)
            </button>
          </div>

          {/* Interactive Live Dashboard Mockup Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/80 bg-white/80 p-3 sm:p-5 shadow-soft-xl dark:border-slate-800 dark:bg-slate-900/80 backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800 text-left">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-400"></span>
                <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                <span className="ml-2 text-xs font-semibold text-slate-500 dark:text-slate-400">Planora AI Interactive Command Center</span>
              </div>
              <div className="text-xs font-medium text-brand-600 dark:text-brand-400">Live Active Plan</div>
            </div>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Target Budget</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">₹5,00,000</p>
                <p className="text-[10px] text-emerald-600 font-medium">100% Allocated</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Guest Count</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">200 Attendees</p>
                <p className="text-[10px] text-brand-600 font-medium">₹2,500 / Guest</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Milestones Done</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">2 / 5 Tasks</p>
                <p className="text-[10px] text-amber-600 font-medium">Next in 4 days</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Vendors Status</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">3 Booked</p>
                <p className="text-[10px] text-indigo-600 font-medium">1 In Negotiation</p>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/40 dark:to-violet-950/40 border border-brand-100 dark:border-brand-900/50 text-left flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bot className="h-5 w-5 text-brand-600 dark:text-brand-400 shrink-0" />
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  <span className="font-semibold text-brand-700 dark:text-brand-300">Planora AI Advisor:</span> "Your Bengali Bhoj menu tasting is scheduled for Nov 22. Venue capacity comfortably supports 200 seated guests with Rajbari decor."
                </p>
              </div>
              <button
                onClick={() => handleLoadSample('sample-bengali-wedding')}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline shrink-0 ml-3"
              >
                Open Plan →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 1. How Planora AI Works */}
      <section id="how-it-works" className="py-20 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">How It Works</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              From Thought to Celebration in 4 Intelligent Steps
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              No generic checklists or empty templates. Planora AI builds personalized, actionable event architecture from your exact vision.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Describe Your Dream',
                desc: 'Enter your event type, date, city, guest count, budget, and describe cultural nuances or preferred styles in natural words.'
              },
              {
                step: '02',
                title: 'Gemini Plan Generation',
                desc: 'Our Gemini 3.8 Flash backend generates structured budgets, preparation timelines, vendor requirements, and day-of schedules.'
              },
              {
                step: '03',
                title: 'Customize & Track',
                desc: 'Track expenses in real-time, adjust vendor contracts, check off tasks, and leverage AI Budget Rescue if expenses exceed targets.'
              },
              {
                step: '04',
                title: 'Simulate & Export',
                desc: 'Test "what-if" guest and budget adjustments safely, chat with your AI assistant, and export professional PDF plans for your team.'
              }
            ].map((item, idx) => (
              <div key={idx} className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
                <span className="text-3xl font-black text-brand-200 dark:text-brand-900">{item.step}</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3">{item.title}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. Event Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Versatile Celebrations</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Crafted for Every Milestone
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Tailored planning frameworks pre-calibrated for distinct celebration styles, cultural traditions, and operational requirements.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Heart,
                color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40',
                title: 'Weddings & Receptions',
                desc: 'Multi-day ceremonial itineraries, mandap and floral styling, regional cuisine feasts, bridal logistics, and vendor tracking.'
              },
              {
                icon: PartyPopper,
                color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40',
                title: 'Birthdays & Milestones',
                desc: 'Themed decor, entertainment booking (magicians, games, DJs), kids mocktails, birthday cakes, and delightful return hampers.'
              },
              {
                icon: Users,
                color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/40',
                title: 'Community & Cultural Events',
                desc: 'Durga Puja, Diwali festivals, public gatherings, staging, sound permits, crowd flow, prasad catering, and volunteer management.'
              },
              {
                icon: Calendar,
                color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40',
                title: 'Anniversaries & Galas',
                desc: 'Intimate silver & golden jubilee dinners, nostalgic audio guestbooks, acoustic bands, and bespoke commemorative gifting.'
              },
              {
                icon: CheckCircle2,
                color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40',
                title: 'Corporate & Conferences',
                desc: 'Keynote staging, AV equipment, attendee kits, catering coffee breaks, breakout sessions, and time-stamped agenda tracks.'
              },
              {
                icon: Sparkles,
                color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/40',
                title: 'Custom Celebrations',
                desc: 'Housewarmings, reunions, or bespoke private gatherings with custom parameters, flexible budgeting, and custom checklists.'
              }
            ].map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-soft-md">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${cat.color} mb-4`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{cat.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Smart Budget Planning & AI Rescue */}
      <section className="py-20 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300 mb-4">
                <Wallet className="h-3.5 w-3.5" />
                <span>Deterministic Financial Math</span>
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Intelligent Budgeting with AI Budget Rescue
              </h3>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Budgeting shouldn't be guesswork. Planora AI deterministically computes category allocations across Venue, Catering, Decoration, Photography, and Emergency Reserves in Indian Rupees.
              </p>
              <div className="mt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Deterministic Math in Application Code</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">All totals, percentages, and variance calculations are strictly verified in code to guarantee zero rounding errors.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Proactive Budget Rescue</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">If planned expenses exceed your budget ceiling, AI detects the exact shortfall and proposes realistic savings alternatives before you spend.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white">Dedicated Emergency Buffer</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Every plan reserves 5%–8% for sudden logistics overtime, generator diesel, or weather contingencies.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  to="/budget"
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-xs font-bold hover:opacity-90 transition"
                >
                  View Budget Planner
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Budget Visual Card */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-soft-lg dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Kolkata Wedding Budget Distribution</h4>
                  <p className="text-xs text-slate-500">Total: ₹5,00,000 for 200 Guests</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg">
                  Balanced
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  { name: 'Catering & Bengali Bhoj', amount: 160000, pct: 32, color: 'bg-pink-500' },
                  { name: 'Venue & Rajbari Hall', amount: 140000, pct: 28, color: 'bg-indigo-600' },
                  { name: 'Decoration & Shola Florals', amount: 70000, pct: 14, color: 'bg-violet-500' },
                  { name: 'Photography & Cinema', amount: 50000, pct: 10, color: 'bg-blue-500' },
                  { name: 'Dhak & Sound Entertainment', amount: 25000, pct: 5, color: 'bg-emerald-500' },
                  { name: 'Emergency Contingency Reserve', amount: 25000, pct: 5, color: 'bg-slate-400' }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="font-bold text-slate-900 dark:text-white">₹{item.amount.toLocaleString('en-IN')} ({item.pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct * 2.5}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 dark:border-rose-900/40 dark:bg-rose-950/30">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold">
                  <ShieldCheck className="h-4 w-4" />
                  <span>AI Budget Rescue Scenario Test</span>
                </div>
                <p className="text-[11px] text-rose-600/90 dark:text-rose-400 mt-1">
                  "If decor quotes come in ₹35,000 higher, AI proposes switching to local Rajnigandha florals and rationalizing appetizer counters to protect your bottom line."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. What-If Simulator Showcase */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-900 via-brand-900 to-slate-950 p-8 sm:p-12 text-white shadow-soft-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Sliders className="h-96 w-96 text-white" />
            </div>

            <div className="max-w-2xl relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/20 px-3.5 py-1 text-xs font-semibold text-violet-200 mb-4">
                <Sliders className="h-3.5 w-3.5" />
                <span>Signature Feature</span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                What-If Event Simulator
              </h3>
              <p className="mt-4 text-slate-300 text-sm sm:text-base leading-relaxed">
                What happens if you increase guests from 150 to 250? Or reduce your budget from ₹5 lakh to ₹4 lakh?
                The What-If Simulator models cost-per-guest shifts, catering headcount pressure, venue capacity, and vendor timeline trade-offs in real-time.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/simulator"
                  className="rounded-xl bg-white text-slate-900 px-6 py-3 text-xs font-bold hover:bg-slate-100 transition shadow-soft-md"
                >
                  Try What-If Simulator
                </Link>
                <button
                  onClick={() => handleLoadSample('sample-bengali-wedding')}
                  className="rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-xs font-semibold text-white hover:bg-white/20 transition"
                >
                  Load Sample Simulation
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Frequently Asked Questions */}
      <section className="py-20 border-t border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Clarity & Confidence</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
              Frequently Asked Questions
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Everything you need to know about how Planora AI brings intelligent engineering to celebration planning.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 transition"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left text-sm font-bold text-slate-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-brand-600 shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 pt-3 dark:border-slate-800">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-soft-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Ready to Plan Your Dream Celebration?
            </h3>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              Start in under 2 minutes. Enter your celebration details, let Gemini craft your personalized blueprint, and manage every milestone with total peace of mind.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/create"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-7 py-3.5 text-sm font-bold text-white shadow-soft-lg hover:shadow-brand-500/25 hover:scale-[1.02] transition"
              >
                Start Planning for Free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <button
                onClick={() => handleLoadSample('sample-bengali-wedding')}
                className="rounded-xl border border-slate-300 bg-slate-50 px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                Inspect Sample Wedding
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-10 bg-white dark:bg-[#090D16]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900 dark:text-white">Planora AI</span>
              <p className="text-[10px] text-slate-500">Your Celebration. Our Intelligence.</p>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Engineered with Google Gemini AI & React TypeScript. Built for reliability, culture, and precision.
          </div>
        </div>
      </footer>
    </div>
  );
};
