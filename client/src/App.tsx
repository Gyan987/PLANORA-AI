import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { EventProvider } from './context/EventContext';
import { AssistantPage } from './pages/AssistantPage';
import { BudgetPage } from './pages/BudgetPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExportPage } from './pages/ExportPage';
import { IdeasPage } from './pages/IdeasPage';
import { LandingPage } from './pages/LandingPage';
import { RiskPage } from './pages/RiskPage';
import { SettingsPage } from './pages/SettingsPage';
import { TimelinePage } from './pages/TimelinePage';
import { VendorsPage } from './pages/VendorsPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { WizardPage } from './pages/WizardPage';

export const App: React.FC = () => {
  return (
    <EventProvider>
      <BrowserRouter>
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
      </BrowserRouter>
    </EventProvider>
  );
};

export default App;
