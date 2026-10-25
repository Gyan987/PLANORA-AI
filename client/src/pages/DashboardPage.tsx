import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  ShieldAlert,
  Sparkles,
  Users,
  Wallet
} from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { useEventContext } from '../context/EventContext';
import { calculateDaysRemaining, calculatePercentage, formatINR } from '../utils/currency';

export const DashboardPage: React.FC = () => {
  const { activeEvent, toggleTask } = useEventContext();

  if (!activeEvent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Sparkles className="h-12 w-12 text-brand-600 mb-3" />
        <h2 className="text-xl font-bold">No Active Event Selected</h2>
        <p className="text-xs text-slate-500 mt-1 mb-4">Create your first celebration plan to get started.</p>
        <Link to="/create" className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white">
          Create New Event
        </Link>
      </div>
    );
  }

  // Deterministic dashboard calculations
  const totalBudget = activeEvent.totalBudget || 0;
  const actualSpending = (activeEvent.expenses || []).reduce((sum, e) => sum + (e.amount || 0), 0);
  const estimatedSpending = (activeEvent.budgetCategories || []).reduce((sum, c) => sum + (c.allocatedAmount || 0), 0);
  const remainingBudget = totalBudget - actualSpending;

  const daysLeft = calculateDaysRemaining(activeEvent.date);

  const tasksTotal = (activeEvent.tasks || []).length;
  const tasksCompleted = (activeEvent.tasks || []).filter((t) => t.completed).length;
  const planningProgress = calculatePercentage(tasksCompleted, tasksTotal);

  const vendorsTotal = (activeEvent.vendors || []).length;
  const vendorsBooked = (activeEvent.vendors || []).filter((v) => v.bookingStatus === 'Booked').length;
  const vendorsPending = vendorsTotal - vendorsBooked;

  // Chart data
  const chartData = (activeEvent.budgetCategories || []).map((cat) => ({
    name: cat.name.split('&')[0].trim(),
    value: cat.allocatedAmount,
    color: cat.color || '#4F46E5'
  }));

  const COLORS = ['#4F46E5', '#EC4899', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#06B6D4', '#64748B'];

  return (
    <div className="space-y-6">
      {/* Top Banner / Event Header */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              {activeEvent.type}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {activeEvent.city}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {activeEvent.guests} Guests
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {activeEvent.name}
          </h1>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-2xl leading-relaxed">
            {activeEvent.overviewSummary}
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
          <Link
            to="/assistant"
            className="flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50/80 px-3.5 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300 transition"
          >
            <Bot className="h-4 w-4" />
            Ask AI Assistant
          </Link>
          <Link
            to="/export"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 text-xs font-bold hover:opacity-90 transition"
          >
            Export Plan PDF
          </Link>
        </div>
      </div>

      {/* 8 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* 1. Total Event Budget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Budget</span>
            <Wallet className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{formatINR(totalBudget)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Target Cap</p>
        </div>

        {/* 2. Estimated Spending */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Allocated</span>
            <span className="text-xs font-bold text-indigo-600">
              {calculatePercentage(estimatedSpending, totalBudget)}%
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{formatINR(estimatedSpending)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across {activeEvent.budgetCategories.length} categories</p>
        </div>

        {/* 3. Actual Spending */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Paid Out</span>
            <span className="text-[10px] font-bold text-emerald-600">
              {(activeEvent.expenses || []).length} items
            </span>
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{formatINR(actualSpending)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Disbursed to vendors</p>
        </div>

        {/* 4. Remaining Budget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Remaining</span>
            <span className={`text-[10px] font-bold ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {remainingBudget >= 0 ? 'Safe' : 'Deficit'}
            </span>
          </div>
          <p className={`text-xl font-extrabold mt-2 ${remainingBudget >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatINR(remainingBudget)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">Available balance</p>
        </div>

        {/* 5. Days Until Event */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Countdown</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            {daysLeft > 0 ? `${daysLeft} Days` : daysLeft === 0 ? 'Today!' : 'Passed'}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{activeEvent.date}</p>
        </div>

        {/* 6. Completed Tasks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tasks</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            {tasksCompleted} / {tasksTotal}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">{tasksTotal - tasksCompleted} pending</p>
        </div>

        {/* 7. Pending Vendors */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendors</span>
            <Users className="h-4 w-4 text-brand-600" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">
            {vendorsBooked} / {vendorsTotal}
          </p>
          <p className="text-[10px] text-amber-600 font-medium mt-0.5">{vendorsPending} awaiting booking</p>
        </div>

        {/* 8. Overall Planning Progress */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progress</span>
            <Sparkles className="h-4 w-4 text-violet-500" />
          </div>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{planningProgress}%</p>
          <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className="h-full bg-brand-600 rounded-full" style={{ width: `${planningProgress}%` }}></div>
          </div>
        </div>
      </div>

      {/* Main Grid: Charts & Next Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spending Distribution Chart (2 cols) */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Budget Allocation by Category</h3>
              <p className="text-xs text-slate-500">Visual distribution of ₹{totalBudget.toLocaleString('en-IN')}</p>
            </div>
            <Link to="/budget" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Manage Budget →
            </Link>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatINR(val), 'Allocation']}
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Milestones (1 col) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Priority Milestones</h3>
              <Link to="/timeline" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {(activeEvent.tasks || []).slice(0, 4).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-start gap-3 transition hover:bg-slate-100/70"
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium leading-snug ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-400">{task.dueDate}</span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        task.priority === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Link
              to="/timeline"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Calendar className="h-3.5 w-3.5" />
              Open Timeline & Day Itinerary
            </Link>
          </div>
        </div>
      </div>

      {/* AI Recommendations & Contingencies */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Risk Alerts Preview */}
        <div className="rounded-3xl border border-amber-200/80 bg-amber-50/50 p-6 shadow-soft-sm dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-bold">Event Risk Radar</h3>
            </div>
            <Link to="/risks" className="text-xs font-bold text-amber-800 dark:text-amber-300 hover:underline">
              Analyze All →
            </Link>
          </div>

          <div className="space-y-2.5">
            {(activeEvent.risks || []).slice(0, 2).map((risk) => (
              <div key={risk.id} className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-amber-200/50 dark:border-amber-900/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{risk.description}</span>
                  <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    risk.severity === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {risk.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-snug">{risk.recommendedAction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contingency Suggestions */}
        <div className="rounded-3xl border border-indigo-200/80 bg-indigo-50/50 p-6 shadow-soft-sm dark:border-indigo-900/40 dark:bg-indigo-950/20">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 mb-3">
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold">AI Contingency Safeguards</h3>
          </div>

          <ul className="space-y-2 text-xs text-indigo-950 dark:text-indigo-300">
            {(activeEvent.contingencySuggestions || []).slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                <span className="leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
