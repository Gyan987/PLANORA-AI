import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoadingFallback } from './components/common/PageLoadingFallback';
import { AppLayout } from './components/layout/AppLayout';
import { EventProvider } from './context/EventContext';
import { LandingPage } from './pages/LandingPage';

// Route-based code splitting for performance & bundle efficiency
const WizardPage = lazy(() => import('./pages/WizardPage').then((m) => ({ default: m.WizardPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const BudgetPage = lazy(() => import('./pages/BudgetPage').then((m) => ({ default: m.BudgetPage })));
const TimelinePage = lazy(() => import('./pages/TimelinePage').then((m) => ({ default: m.TimelinePage })));
const VendorsPage = lazy(() => import('./pages/VendorsPage').then((m) => ({ default: m.VendorsPage })));
const AssistantPage = lazy(() => import('./pages/AssistantPage').then((m) => ({ default: m.AssistantPage })));
const IdeasPage = lazy(() => import('./pages/IdeasPage').then((m) => ({ default: m.IdeasPage })));
const WhatIfPage = lazy(() => import('./pages/WhatIfPage').then((m) => ({ default: m.WhatIfPage })));
const RiskPage = lazy(() => import('./pages/RiskPage').then((m) => ({ default: m.RiskPage })));
const ExportPage = lazy(() => import('./pages/ExportPage').then((m) => ({ default: m.ExportPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <EventProvider>
        <BrowserRouter>
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/" element={<LandingPage />} />

              {/* Event Creation Wizard */}
              <Route path="/create" element={<WizardPage />} />

              {/* Protected Event Workspace Dashboard Layout */}
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/budget" element={<BudgetPage />} />
                <Route path="/timeline" element={<TimelinePage />} />
                <Route path="/vendors" element={<VendorsPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/ideas" element={<IdeasPage />} />
                <Route path="/simulator" element={<WhatIfPage />} />
                <Route path="/risks" element={<RiskPage />} />
                <Route path="/export" element={<ExportPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </EventProvider>
    </ErrorBoundary>
  );
};

export default App;
