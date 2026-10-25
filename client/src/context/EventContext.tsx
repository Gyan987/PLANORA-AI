import React, { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '../services/storage';
import {
  BudgetCategory,
  DayScheduleItem,
  EventIdea,
  EventPlan,
  ExpenseItem,
  PrepTask,
  VendorItem
} from '../types';

interface EventContextType {
  events: EventPlan[];
  activeEvent: EventPlan;
  theme: 'light' | 'dark';
  user: { name: string; email: string; avatar?: string } | null;
  toggleTheme: () => void;
  setUser: (user: { name: string; email: string; avatar?: string } | null) => void;
  selectEvent: (id: string) => void;
  saveNewPlan: (plan: EventPlan) => void;
  updateActiveEvent: (updated: Partial<EventPlan>) => void;
  deleteEvent: (id: string) => void;
  // Expense operations
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (id: string) => void;
  // Task operations
  toggleTask: (id: string) => void;
  addTask: (task: Omit<PrepTask, 'id'>) => void;
  deleteTask: (id: string) => void;
  // Schedule operations
  addScheduleItem: (item: Omit<DayScheduleItem, 'id'>) => void;
  deleteScheduleItem: (id: string) => void;
  // Vendor operations
  addVendor: (vendor: Omit<VendorItem, 'id'>) => void;
  updateVendor: (vendor: VendorItem) => void;
  deleteVendor: (id: string) => void;
  // Ideas
  saveIdeaToPlan: (idea: EventIdea) => void;
  // What-If & Budget Rescue
  applySimulation: (proposedBudget: number, proposedGuests: number, categories: BudgetCategory[]) => void;
  applyBudgetRescue: (categories: BudgetCategory[]) => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<EventPlan[]>(() => storage.getEvents());
  const [activeEventId, setActiveEventId] = useState<string>(() => storage.getActiveEventId());
  const [theme, setTheme] = useState<'light' | 'dark'>(() => storage.getTheme());
  const [user, setUserState] = useState<{ name: string; email: string; avatar?: string } | null>(() => storage.getUser());

  // Apply dark mode to document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.setTheme(theme);
  }, [theme]);

  // Find active event
  const activeEvent = events.find((e) => e.id === activeEventId) || events[0];

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const setUser = (u: { name: string; email: string; avatar?: string } | null) => {
    setUserState(u);
    storage.setUser(u);
  };

  const selectEvent = (id: string) => {
    setActiveEventId(id);
    storage.setActiveEventId(id);
  };

  const saveNewPlan = (plan: EventPlan) => {
    storage.saveEvent(plan);
    const updated = storage.getEvents();
    setEvents(updated);
    setActiveEventId(plan.id);
  };

  const updateActiveEvent = (patch: Partial<EventPlan>) => {
    if (!activeEvent) return;
    const updated = { ...activeEvent, ...patch, updatedAt: new Date().toISOString() };
    const newEvents = events.map((e) => (e.id === activeEvent.id ? updated : e));
    setEvents(newEvents);
    storage.saveEvents(newEvents);
  };

  const deleteEvent = (id: string) => {
    storage.deleteEvent(id);
    const updated = storage.getEvents();
    setEvents(updated);
    if (activeEventId === id && updated.length > 0) {
      setActiveEventId(updated[0].id);
    }
  };

  // Add Expense
  const addExpense = (expenseData: Omit<ExpenseItem, 'id'>) => {
    if (!activeEvent) return;
    const newExpense: ExpenseItem = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    const newExpenses = [newExpense, ...(activeEvent.expenses || [])];

    // Recalculate category actualAmount deterministically
    const updatedCategories = activeEvent.budgetCategories.map((cat) => {
      const catExpenses = newExpenses.filter((e) => e.categoryId === cat.id);
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, actualAmount: total };
    });

    updateActiveEvent({
      expenses: newExpenses,
      budgetCategories: updatedCategories
    });
  };

  // Delete Expense
  const deleteExpense = (id: string) => {
    if (!activeEvent) return;
    const newExpenses = (activeEvent.expenses || []).filter((e) => e.id !== id);
    const updatedCategories = activeEvent.budgetCategories.map((cat) => {
      const catExpenses = newExpenses.filter((e) => e.categoryId === cat.id);
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { ...cat, actualAmount: total };
    });

    updateActiveEvent({
      expenses: newExpenses,
      budgetCategories: updatedCategories
    });
  };

  // Toggle Task
  const toggleTask = (id: string) => {
    if (!activeEvent) return;
    const newTasks = (activeEvent.tasks || []).map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    updateActiveEvent({ tasks: newTasks });
  };

  // Add Task
  const addTask = (taskData: Omit<PrepTask, 'id'>) => {
    if (!activeEvent) return;
    const newTask: PrepTask = { ...taskData, id: `t-${Date.now()}` };
    updateActiveEvent({ tasks: [...(activeEvent.tasks || []), newTask] });
  };

  // Delete Task
  const deleteTask = (id: string) => {
    if (!activeEvent) return;
    updateActiveEvent({ tasks: (activeEvent.tasks || []).filter((t) => t.id !== id) });
  };

  // Add Schedule Item
  const addScheduleItem = (itemData: Omit<DayScheduleItem, 'id'>) => {
    if (!activeEvent) return;
    const newItem: DayScheduleItem = { ...itemData, id: `ds-${Date.now()}` };
    updateActiveEvent({ daySchedule: [...(activeEvent.daySchedule || []), newItem] });
  };

  // Delete Schedule Item
  const deleteScheduleItem = (id: string) => {
    if (!activeEvent) return;
    updateActiveEvent({ daySchedule: (activeEvent.daySchedule || []).filter((s) => s.id !== id) });
  };

  // Add Vendor
  const addVendor = (vendorData: Omit<VendorItem, 'id'>) => {
    if (!activeEvent) return;
    const newVendor: VendorItem = { ...vendorData, id: `v-${Date.now()}` };
    updateActiveEvent({ vendors: [...(activeEvent.vendors || []), newVendor] });
  };

  // Update Vendor
  const updateVendor = (vendor: VendorItem) => {
    if (!activeEvent) return;
    const newVendors = (activeEvent.vendors || []).map((v) => (v.id === vendor.id ? vendor : v));
    updateActiveEvent({ vendors: newVendors });
  };

  // Delete Vendor
  const deleteVendor = (id: string) => {
    if (!activeEvent) return;
    updateActiveEvent({ vendors: (activeEvent.vendors || []).filter((v) => v.id !== id) });
  };

  // Save Idea to Plan
  const saveIdeaToPlan = (idea: EventIdea) => {
    if (!activeEvent) return;
    const existing = (activeEvent.ideas || []).some((i) => i.title === idea.title);
    if (!existing) {
      updateActiveEvent({ ideas: [...(activeEvent.ideas || []), { ...idea, saved: true }] });
    }
  };

  // Apply Simulation
  const applySimulation = (proposedBudget: number, proposedGuests: number, categories: BudgetCategory[]) => {
    if (!activeEvent) return;
    updateActiveEvent({
      totalBudget: proposedBudget,
      guests: proposedGuests,
      budgetCategories: categories
    });
  };

  // Apply Budget Rescue
  const applyBudgetRescue = (categories: BudgetCategory[]) => {
    if (!activeEvent) return;
    updateActiveEvent({
      budgetCategories: categories
    });
  };

  return (
    <EventContext.Provider
      value={{
        events,
        activeEvent,
        theme,
        user,
        toggleTheme,
        setUser,
        selectEvent,
        saveNewPlan,
        updateActiveEvent,
        deleteEvent,
        addExpense,
        deleteExpense,
        toggleTask,
        addTask,
        deleteTask,
        addScheduleItem,
        deleteScheduleItem,
        addVendor,
        updateVendor,
        deleteVendor,
        saveIdeaToPlan,
        applySimulation,
        applyBudgetRescue
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within an EventProvider');
  }
  return context;
};
