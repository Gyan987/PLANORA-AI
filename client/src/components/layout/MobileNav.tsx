import {
  AlertTriangle,
  Bot,
  Calendar,
  FileDown,
  LayoutDashboard,
  Lightbulb,
  Sliders,
  Users,
  Wallet
} from 'lucide-react';
import React from 'react';
import { NavLink } from 'react-router-dom';

const MOBILE_NAV_ITEMS = [
  { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Budget', path: '/budget', icon: Wallet },
  { name: 'Timeline', path: '/timeline', icon: Calendar },
  { name: 'Vendors', path: '/vendors', icon: Users },
  { name: 'AI Chat', path: '/assistant', icon: Bot },
  { name: 'Simulator', path: '/simulator', icon: Sliders },
  { name: 'Risks', path: '/risks', icon: AlertTriangle },
  { name: 'Export', path: '/export', icon: FileDown }
];

export const MobileNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#090D16]/95">
      <div className="flex items-center justify-around overflow-x-auto py-2 px-1">
        {MOBILE_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[54px] py-1 text-[10px] font-medium transition ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`
              }
            >
              <Icon className="h-4 w-4 mb-0.5" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
