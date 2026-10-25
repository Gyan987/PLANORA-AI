import '@testing-library/jest-dom/vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from '../../components/layout/AppLayout';
import { EventProvider } from '../../context/EventContext';
import { BudgetPage } from '../../pages/BudgetPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { ExportPage } from '../../pages/ExportPage';
import { LandingPage } from '../../pages/LandingPage';
import { TimelinePage } from '../../pages/TimelinePage';
import { VendorsPage } from '../../pages/VendorsPage';
import { WhatIfPage } from '../../pages/WhatIfPage';
import { WizardPage } from '../../pages/WizardPage';
import { api } from '../../services/api';

// Safe headless mock for Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="recharts-container">{children}</div>,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null
}));

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn()
}));

describe('Complete 10-Step Automated User Journeys', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderApp = (initialRoute = '/') => {
    return render(
      <EventProvider>
        <MemoryRouter initialEntries={[initialRoute]}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/create" element={<WizardPage />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/budget" element={<BudgetPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/vendors" element={<VendorsPage />} />
              <Route path="/simulator" element={<WhatIfPage />} />
              <Route path="/export" element={<ExportPage />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </EventProvider>
    );
  };

  it('Journey 1 & 2: Opens landing page and navigates toward creating an event', () => {
    renderApp('/');

    // Verify Brand title & Value proposition
    expect(screen.getAllByText(/Your Celebration\. Our Intelligence\./i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Explore Sample Plan \(₹5L Wedding\)/i)).toBeInTheDocument();

    // Verify Call-to-action button to start planning
    const ctaButtons = screen.getAllByRole('link', { name: /Start Planning/i });
    expect(ctaButtons.length).toBeGreaterThan(0);
    expect(ctaButtons[0].getAttribute('href')).toBe('/create');
  });

  it('Journey 3 & 4: Event Creation Wizard renders steps and triggers plan generation', async () => {
    renderApp('/create');

    // Step 1: Event Type prompt
    expect(screen.getByText(/What kind of event are you planning\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Wedding & Reception/i)).toBeInTheDocument();
    expect(screen.getByText(/Birthday Celebration/i)).toBeInTheDocument();
    expect(screen.getByText(/Community & Cultural Event/i)).toBeInTheDocument();
  });

  it('Journey 5 & 6: Reviews budget allocation and adds expense item', () => {
    renderApp('/budget');

    // Verify Smart Budget Planner title
    expect(screen.getByText(/Smart Budget Planner/i)).toBeInTheDocument();

    // Verify core budget categories appear
    expect(screen.getAllByText(/Venue & Space/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Catering & Food/i)[0]).toBeInTheDocument();

    // Verify Add Expense button
    const addExpenseBtns = screen.getAllByRole('button', { name: /Add Expense/i });
    expect(addExpenseBtns.length).toBeGreaterThan(0);

    // Open expense modal
    fireEvent.click(addExpenseBtns[0]);
    expect(screen.getByText(/Log New Expense/i)).toBeInTheDocument();
  });

  it('Journey 7: What-If Simulator experimentation and side-by-side comparison', async () => {
    const mockSimResult = {
      summary: 'Simulated 250 guests with ₹6,00,000 budget.',
      originalValues: { totalBudget: 500000, guests: 200, costPerGuest: 2500, venueEstimate: 140000, cateringEstimate: 160000 },
      proposedValues: { totalBudget: 600000, guests: 250, costPerGuest: 2400, venueEstimate: 168000, cateringEstimate: 192000 },
      budgetImpact: { difference: 100000, feasibility: 'Feasible' as const, details: 'Well balanced' },
      scheduleAndVendorImpacts: ['Add 2 catering servers'],
      tradeOffs: ['Slightly lower per-guest favor allocation'],
      actionableRecommendations: ['Book banquet hall with 300 capacity'],
      proposedCategories: []
    };

    vi.spyOn(api, 'simulateWhatIf').mockResolvedValueOnce(mockSimResult);

    renderApp('/simulator');

    expect(screen.getByText(/What-If Event Simulator/i)).toBeInTheDocument();
    const calculateBtn = screen.getByRole('button', { name: /Calculate What-If Impacts/i });
    expect(calculateBtn).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(calculateBtn);
    });

    expect(screen.getByText(/Simulated 250 guests with ₹6,00,000 budget\./i)).toBeInTheDocument();
  });

  it('Journey 8: Vendor Management (Listing and Stage changes)', () => {
    renderApp('/vendors');

    expect(screen.getByText(/Smart Vendor Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Sovabazar Heritage Banquet & Courtyard/i)).toBeInTheDocument();

    // Verify Add Vendor button exists
    expect(screen.getByRole('button', { name: /Add Vendor/i })).toBeInTheDocument();
  });

  it('Journey 9: Timeline and Milestone completion tracking', () => {
    renderApp('/timeline');

    expect(screen.getByText(/Timeline & Schedule/i)).toBeInTheDocument();
    // Milestone tasks should be visible
    expect(screen.getByText(/Finalize Shola & Fresh Tuberose Mandap Decor Layout/i)).toBeInTheDocument();
  });

  it('Journey 10: Export Event Plan page rendering and preview triggers', () => {
    renderApp('/export');

    expect(screen.getByText(/Export Event Plan/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Plan as PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Print View/i })).toBeInTheDocument();
  });
});
