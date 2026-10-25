import React from 'react';
import { Outlet } from 'react-router-dom';
import { MobileNav } from './MobileNav';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 dark:bg-[#090D16] dark:text-slate-100 flex flex-col transition-colors">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
