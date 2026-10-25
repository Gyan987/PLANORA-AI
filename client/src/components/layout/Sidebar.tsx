import {
  AlertTriangle,
  Bot,
  Calendar,
  CheckSquare,
  FileDown,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Sliders,
  Users,
  Wallet
} from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Budget Planner', path: '/budget', icon: Wallet, badge: 'AI Rescue' },
  { name: 'Timeline & Tasks', path: '/timeline', icon: Calendar },
  { name: 'Vendor Manager', path: '/vendors', icon: Users },
  { name: 'AI Assistant', path: '/assistant', icon: Bot, highlight: true },
  { name: 'Ideas & Inspiration', path: '/ideas', icon: Lightbulb },
  { name: 'What-If Simulator', path: '/simulator', icon: Sliders, badge: 'Signature' },
  { name: 'Risk Analyzer', path: '/risks', icon: AlertTriangle },
  { name: 'Export Plan', path: '/export', icon: FileDown },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white/70 backdrop-blur-md dark:border-slate-800 dark:bg-[#090D16]/70 hidden md:block">
      <div className="flex flex-col h-[calc(100vh-4rem)] sticky top-16 justify-between p-4">
        {/* Navigation list */}
        <div className="space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Event Management
          </div>

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition group ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-soft-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`h-4 w-4 transition-colors ${
                          isActive
                            ? 'text-white'
                            : item.highlight
                            ? 'text-violet-500 group-hover:text-violet-600'
                            : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badge === 'Signature'
                            ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Gemini Engine Indicator */}
        <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 p-3 dark:border-indigo-900/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-violet-950/30">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white text-[10px]">
              ✨
            </div>
            <div>
              <p className="text-xs font-bold text-indigo-950 dark:text-indigo-200">Gemini 3.8 Flash</p>
              <p className="text-[10px] text-indigo-600/80 dark:text-indigo-400">Contextual Engine Active</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
