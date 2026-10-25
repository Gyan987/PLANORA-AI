import { act, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';
import { EventProvider, useEventContext } from '../../context/EventContext';
import { BudgetCategory, VendorItem } from '../../types';

describe('EventContext Integration Tests', () => {
  const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <EventProvider>{children}</EventProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with sample event and default light theme', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    expect(result.current.activeEvent).toBeDefined();
    expect(result.current.theme).toBe('light');
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('toggles theme between light and dark', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    expect(result.current.theme).toBe('light');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('dark');

    act(() => {
      result.current.toggleTheme();
    });
    expect(result.current.theme).toBe('light');
  });

  it('adds an expense and automatically updates category actualAmount', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const targetCategory = result.current.activeEvent.budgetCategories[0];
    const initialCatTotal = result.current.activeEvent.expenses
      .filter((e) => e.categoryId === targetCategory.id)
      .reduce((sum, e) => sum + e.amount, 0);
    const expenseAmount = 15000;

    act(() => {
      result.current.addExpense({
        categoryId: targetCategory.id,
        categoryName: targetCategory.name,
        name: 'Stage Mandap Flower Advance',
        amount: expenseAmount,
        date: '2026-10-20',
        paid: true
      });
    });

    const updatedCategory = result.current.activeEvent.budgetCategories.find((c) => c.id === targetCategory.id);
    expect(updatedCategory?.actualAmount).toBe(initialCatTotal + expenseAmount);
    expect(result.current.activeEvent.expenses[0].name).toBe('Stage Mandap Flower Advance');
  });

  it('deletes an expense and recalculates category actualAmount', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const targetCategory = result.current.activeEvent.budgetCategories[0];

    // Add expense
    act(() => {
      result.current.addExpense({
        categoryId: targetCategory.id,
        categoryName: targetCategory.name,
        name: 'Temporary Token Deposit',
        amount: 8000,
        date: '2026-10-22',
        paid: true
      });
    });

    const addedExpenseId = result.current.activeEvent.expenses[0].id;
    const actualBeforeDelete = result.current.activeEvent.budgetCategories.find((c) => c.id === targetCategory.id)?.actualAmount || 0;

    // Delete expense
    act(() => {
      result.current.deleteExpense(addedExpenseId);
    });

    const actualAfterDelete = result.current.activeEvent.budgetCategories.find((c) => c.id === targetCategory.id)?.actualAmount || 0;
    expect(actualAfterDelete).toBe(actualBeforeDelete - 8000);
  });

  it('manages task lifecycle (add, toggle completion, delete)', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    // Add task
    act(() => {
      result.current.addTask({
        title: 'Book Shehnai & Dhak Players',
        category: 'Entertainment',
        priority: 'High',
        dueDate: '2026-11-10',
        completed: false
      });
    });

    const newTask = result.current.activeEvent.tasks.find((t) => t.title === 'Book Shehnai & Dhak Players');
    expect(newTask).toBeDefined();
    expect(newTask?.completed).toBe(false);

    // Toggle task
    act(() => {
      if (newTask) result.current.toggleTask(newTask.id);
    });

    const toggledTask = result.current.activeEvent.tasks.find((t) => t.id === newTask?.id);
    expect(toggledTask?.completed).toBe(true);

    // Delete task
    act(() => {
      if (newTask) result.current.deleteTask(newTask.id);
    });

    expect(result.current.activeEvent.tasks.find((t) => t.id === newTask?.id)).toBeUndefined();
  });

  it('manages vendor lifecycle (add, update status, delete)', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });

    // Add vendor
    act(() => {
      result.current.addVendor({
        name: 'Kolkata Royal Shehnai Ensemble',
        category: 'Entertainment',
        contactName: 'Mahesh Pandit',
        phone: '+91 98311 12345',
        email: 'mahesh@shehnai.in',
        estimatedPrice: 20000,
        agreedPrice: 18000,
        paymentStatus: 'Unpaid',
        bookingStatus: 'Contacted'
      });
    });

    const newVendor = result.current.activeEvent.vendors.find((v) => v.name === 'Kolkata Royal Shehnai Ensemble');
    expect(newVendor).toBeDefined();
    expect(newVendor?.bookingStatus).toBe('Contacted');

    // Update vendor to Booked
    act(() => {
      if (newVendor) {
        const updated: VendorItem = { ...newVendor, bookingStatus: 'Booked', paymentStatus: 'Deposit Paid' };
        result.current.updateVendor(updated);
      }
    });

    const updatedVendor = result.current.activeEvent.vendors.find((v) => v.id === newVendor?.id);
    expect(updatedVendor?.bookingStatus).toBe('Booked');
    expect(updatedVendor?.paymentStatus).toBe('Deposit Paid');

    // Delete vendor
    act(() => {
      if (newVendor) result.current.deleteVendor(newVendor.id);
    });

    expect(result.current.activeEvent.vendors.find((v) => v.id === newVendor?.id)).toBeUndefined();
  });

  it('applies what-if simulation to active event', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const originalBudget = result.current.activeEvent.totalBudget;
    const newBudget = 650000;
    const newGuests = 280;

    const modifiedCategories: BudgetCategory[] = result.current.activeEvent.budgetCategories.map((c) => ({
      ...c,
      allocatedAmount: Math.round((c.allocatedAmount * newBudget) / originalBudget)
    }));

    act(() => {
      result.current.applySimulation(newBudget, newGuests, modifiedCategories);
    });

    expect(result.current.activeEvent.totalBudget).toBe(newBudget);
    expect(result.current.activeEvent.guests).toBe(newGuests);
    expect(result.current.activeEvent.budgetCategories[0].allocatedAmount).toBe(modifiedCategories[0].allocatedAmount);
  });

  it('applies budget rescue proposed allocations', () => {
    const { result } = renderHook(() => useEventContext(), { wrapper });
    const rescuedCategories: BudgetCategory[] = result.current.activeEvent.budgetCategories.map((c, i) => ({
      ...c,
      allocatedAmount: i === 0 ? c.allocatedAmount - 10000 : c.allocatedAmount
    }));

    act(() => {
      result.current.applyBudgetRescue(rescuedCategories);
    });

    expect(result.current.activeEvent.budgetCategories[0].allocatedAmount).toBe(rescuedCategories[0].allocatedAmount);
  });
});
