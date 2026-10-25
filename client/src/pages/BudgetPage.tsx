import {
  AlertCircle,
  ArrowRight,
  Bot,
  CheckCircle2,
  DollarSign,
  Edit2,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Trash2,
  Wallet
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { useEventContext } from '../context/EventContext';
import { api } from '../services/api';
import { BudgetCategory, ExpenseItem } from '../types';
import { calculatePercentage, formatINR } from '../utils/currency';

export const BudgetPage: React.FC = () => {
  const { activeEvent, addExpense, deleteExpense, updateActiveEvent, applyBudgetRescue } = useEventContext();

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    name: '',
    categoryId: activeEvent?.budgetCategories[0]?.id || '',
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    paid: true,
    notes: ''
  });

  // AI Rescue State
  const [isRescuing, setIsRescuing] = useState(false);
  const [rescueResult, setRescueResult] = useState<{
    overspendAmount: number;
    isOverBudget: boolean;
    explanation: string;
    recommendations: any[];
    proposedCategories: BudgetCategory[];
  } | null>(null);
  const [rescueApplied, setRescueApplied] = useState(false);

  if (!activeEvent) return null;

  const totalBudget = activeEvent.totalBudget || 0;
  const totalAllocated = (activeEvent.budgetCategories || []).reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
  const totalActual = (activeEvent.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const remainingBudget = totalBudget - totalActual;
  const isOverBudget = totalActual > totalBudget || totalAllocated > totalBudget;
  const overspendAmount = Math.max(0, Math.max(totalActual, totalAllocated) - totalBudget);

  const reserveCategory = (activeEvent.budgetCategories || []).find((c) =>
    c.name.toLowerCase().includes('reserve') || c.name.toLowerCase().includes('contingency')
  );

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.name || !expenseForm.categoryId || expenseForm.amount <= 0) return;

    const cat = activeEvent.budgetCategories.find((c) => c.id === expenseForm.categoryId);
    addExpense({
      name: expenseForm.name,
      categoryId: expenseForm.categoryId,
      categoryName: cat?.name || 'General',
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      paid: expenseForm.paid,
      notes: expenseForm.notes
    });

    setIsExpenseModalOpen(false);
    setExpenseForm({
      name: '',
      categoryId: activeEvent.budgetCategories[0]?.id || '',
      amount: 5000,
      date: new Date().toISOString().split('T')[0],
      paid: true,
      notes: ''
    });
  };

  const runBudgetRescue = async () => {
    setIsRescuing(true);
    try {
      const res = await api.rescueBudget({
        totalBudget: activeEvent.totalBudget,
        currentExpenses: Math.max(totalActual, totalAllocated),
        categories: activeEvent.budgetCategories,
        eventType: activeEvent.type,
        guests: activeEvent.guests,
        city: activeEvent.city
      });
      setRescueResult(res);
      setRescueApplied(false);
    } catch (err) {
      console.error('Budget rescue error:', err);
    } finally {
      setIsRescuing(false);
    }
  };

  const handleApplyRescue = () => {
    if (rescueResult && rescueResult.proposedCategories) {
      applyBudgetRescue(rescueResult.proposedCategories);
      setRescueApplied(true);
    }
  };

  // Bar chart comparing planned vs actual
  const comparisonData = (activeEvent.budgetCategories || []).map((cat) => ({
    name: cat.name.split('&')[0].trim(),
    Planned: cat.allocatedAmount,
    Actual: cat.actualAmount
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Smart Budget Planner
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Deterministic allocation, real-time expense tracking, and AI financial rescue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runBudgetRescue}
            disabled={isRescuing}
            className="flex items-center gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300 transition"
          >
            {isRescuing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
            AI Budget Rescue
          </button>

          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </div>

      {/* AI Budget Rescue Banner (If Over Budget or triggered) */}
      {(isOverBudget || rescueResult) && (
        <div className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 shadow-soft-sm dark:border-rose-900/50 dark:bg-rose-950/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0 mt-0.5">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-rose-950 dark:text-rose-200">
                  {overspendAmount > 0
                    ? `Your estimated expenses exceed your budget by ${formatINR(overspendAmount)}.`
                    : 'AI Budget Audit Complete'}
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-1 max-w-2xl leading-relaxed">
                  {rescueResult?.explanation ||
                    'Click "AI Budget Rescue" above to receive concrete, pre-calculated reallocations that bring your event spending back into safe boundaries.'}
                </p>
              </div>
            </div>

            {rescueResult && rescueResult.recommendations.length > 0 && !rescueApplied && (
              <button
                onClick={handleApplyRescue}
                className="shrink-0 rounded-xl bg-rose-600 px-5 py-2.5 text-xs font-bold text-white shadow-soft-md hover:bg-rose-700 transition"
              >
                Apply Proposed Rescue Plan
              </button>
            )}

            {rescueApplied && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl shrink-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Rescue Plan Applied</span>
              </div>
            )}
          </div>

          {/* Rescue Action Cards */}
          {rescueResult && rescueResult.recommendations.length > 0 && (
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-rose-200/80 pt-4 dark:border-rose-900/40">
              {rescueResult.recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-xl border border-rose-200 bg-white p-3.5 dark:border-rose-900/50 dark:bg-slate-900">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800 dark:text-slate-200">
                    <span>{rec.category}</span>
                    <span className="text-emerald-600 font-extrabold">Save {formatINR(rec.savings)}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">{rec.action}</p>
                  <p className="text-[10px] text-slate-400 mt-1 italic">{rec.tradeoff}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Event Budget</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{formatINR(totalBudget)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{activeEvent.guests} guests (₹{Math.round(totalBudget / activeEvent.guests).toLocaleString('en-IN')}/guest)</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Planned Allocation</p>
          <p className="text-2xl font-extrabold text-indigo-600 mt-1.5">{formatINR(totalAllocated)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{calculatePercentage(totalAllocated, totalBudget)}% of ceiling</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Spent</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">{formatINR(totalActual)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{calculatePercentage(totalActual, totalBudget)}% disbursed</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Emergency Buffer</p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1.5">
            {formatINR(reserveCategory?.allocatedAmount || Math.round(totalBudget * 0.05))}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Dedicated contingency</p>
        </div>
      </div>

      {/* Planned vs Actual Spending Chart */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
          Planned vs. Actual Spend per Category
        </h3>
        <p className="text-xs text-slate-500 mb-6">Compare allocated ceiling against logged disbursements</p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [formatINR(v)]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Planned" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Allocations Grid */}
      <div>
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4">
          Category Allocations ({activeEvent.budgetCategories.length} Areas)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeEvent.budgetCategories.map((cat) => {
            const pct = calculatePercentage(cat.actualAmount, cat.allocatedAmount);
            const isCatOver = cat.actualAmount > cat.allocatedAmount;

            return (
              <div
                key={cat.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{cat.name}</span>
                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      {formatINR(cat.allocatedAmount)}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 mb-3">{cat.notes}</p>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Spent: {formatINR(cat.actualAmount)}</span>
                      <span className={isCatOver ? 'text-rose-600 font-bold' : 'text-slate-600'}>{pct}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isCatOver ? 'bg-rose-500' : 'bg-brand-600'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Target: {cat.percentage}% of total</span>
                  <button
                    onClick={() => {
                      setExpenseForm({
                        ...expenseForm,
                        categoryId: cat.id
                      });
                      setIsExpenseModalOpen(true);
                    }}
                    className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
                  >
                    + Add Expense
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disbursed Expenses Table */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Logged Expenses</h3>
            <p className="text-xs text-slate-500">Itemized audit of paid disbursements</p>
          </div>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            + Log New Payment
          </button>
        </div>

        {(activeEvent.expenses || []).length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            No expenses logged yet. Click "Add Expense" to record an advance or invoice payment.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px]">
                  <th className="py-3 px-3">Expense Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeEvent.expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">{exp.name}</td>
                    <td className="py-3 px-3 text-slate-500">{exp.categoryName}</td>
                    <td className="py-3 px-3 text-slate-400">{exp.date}</td>
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">{formatINR(exp.amount)}</td>
                    <td className="py-3 px-3">
                      <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        Paid
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => deleteExpense(exp.id)}
                        className="text-slate-400 hover:text-rose-600 transition"
                        title="Delete Expense"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-soft-2xl dark:border-slate-800 dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Log New Expense</h3>
            <p className="text-xs text-slate-500 mb-4">Record an advance or settlement payment.</p>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Expense Name</label>
                <input
                  type="text"
                  required
                  value={expenseForm.name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })}
                  placeholder="e.g. Caterer Tasting Token, Decor Advance"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                <select
                  value={expenseForm.categoryId}
                  onChange={(e) => setExpenseForm({ ...expenseForm, categoryId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
                >
                  {activeEvent.budgetCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} ({formatINR(cat.allocatedAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Amount (INR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <input
                  type="text"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="Receipt # or UPI reference ID"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
