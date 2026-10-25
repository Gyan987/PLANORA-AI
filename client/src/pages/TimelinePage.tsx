import {
  AlertCircle,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Filter,
  ListTodo,
  Plus,
  Trash2
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Modal } from '../components/common/Modal';
import { useEventContext } from '../context/EventContext';
import { DayScheduleItem, PrepTask, TaskPriority } from '../types';
import { calculateDaysRemaining } from '../utils/currency';

export const TimelinePage: React.FC = () => {
  const { activeEvent, toggleTask, addTask, deleteTask, addScheduleItem, deleteScheduleItem } = useEventContext();

  const [activeTab, setActiveTab] = useState<'prep' | 'daySchedule'>('prep');
  const [priorityFilter, setPriorityFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');

  // Task Modal
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '',
    category: 'Coordination',
    priority: 'High' as TaskPriority,
    dueDate: activeEvent?.date || '',
    notes: ''
  });

  // Schedule Modal
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    time: '10:00 AM',
    activity: '',
    location: '',
    responsiblePerson: ''
  });

  if (!activeEvent) return null;

  const tasks = activeEvent.tasks || [];
  const completedCount = tasks.filter((t) => t.completed).length;

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (priorityFilter !== 'All' && t.priority !== priorityFilter) return false;
      if (statusFilter === 'Pending' && t.completed) return false;
      if (statusFilter === 'Completed' && !t.completed) return false;
      return true;
    });
  }, [tasks, priorityFilter, statusFilter]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.title) return;
    addTask({
      title: taskForm.title,
      category: taskForm.category,
      priority: taskForm.priority,
      dueDate: taskForm.dueDate || activeEvent.date,
      completed: false,
      notes: taskForm.notes
    });
    setIsTaskModalOpen(false);
    setTaskForm({
      title: '',
      category: 'Coordination',
      priority: 'High',
      dueDate: activeEvent.date,
      notes: ''
    });
  };

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.activity) return;
    addScheduleItem({
      time: scheduleForm.time,
      activity: scheduleForm.activity,
      location: scheduleForm.location,
      responsiblePerson: scheduleForm.responsiblePerson
    });
    setIsScheduleModalOpen(false);
    setScheduleForm({
      time: '10:00 AM',
      activity: '',
      location: '',
      responsiblePerson: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Timeline & Schedule
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Dynamic preparation countdown and hour-by-hour event day itinerary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={() => setActiveTab('prep')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'prep'
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Preparation Milestones ({completedCount}/{tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('daySchedule')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                activeTab === 'daySchedule'
                  ? 'bg-brand-600 text-white shadow-soft-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              Event-Day Itinerary ({(activeEvent.daySchedule || []).length})
            </button>
          </div>

          {activeTab === 'prep' ? (
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          ) : (
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-2 text-xs font-bold text-white shadow-soft-sm hover:opacity-95 transition"
            >
              <Plus className="h-4 w-4" />
              Add Activity
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Preparation Timeline */}
      {activeTab === 'prep' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-soft-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter By:</span>
              <div className="flex items-center gap-1.5">
                {(['All', 'High', 'Medium', 'Low'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                      priorityFilter === p
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                        : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p} Priority
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {(['All', 'Pending', 'Completed'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    statusFilter === s
                      ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 font-bold'
                      : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline List */}
          <div className="relative pl-6 border-l-2 border-brand-200 dark:border-brand-900/60 ml-4 space-y-6">
            {filteredTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                No tasks match the active filters.
              </div>
            ) : (
              filteredTasks.map((task) => {
                const daysUntilDue = calculateDaysRemaining(task.dueDate);
                const isOverdue = daysUntilDue < 0 && !task.completed;

                return (
                  <div key={task.id} className="relative group">
                    {/* Timeline Node Point */}
                    <div
                      className={`absolute -left-[31px] top-4 h-4 w-4 rounded-full border-2 bg-white transition ${
                        task.completed
                          ? 'border-emerald-500 bg-emerald-500'
                          : isOverdue
                          ? 'border-rose-500 bg-rose-500'
                          : 'border-brand-600 dark:border-brand-400 dark:bg-slate-900'
                      }`}
                    ></div>

                    <div
                      className={`rounded-2xl border p-4 shadow-soft-sm transition ${
                        task.completed
                          ? 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-900/50 opacity-80'
                          : isOverdue
                          ? 'border-rose-200 bg-rose-50/50 dark:border-rose-900/40 dark:bg-rose-950/20'
                          : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:shadow-soft-md'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                          />
                          <div>
                            <h4
                              className={`text-sm font-bold ${
                                task.completed
                                  ? 'line-through text-slate-400'
                                  : 'text-slate-900 dark:text-white'
                              }`}
                            >
                              {task.title}
                            </h4>
                            {task.notes && (
                              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                              task.priority === 'High'
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                : task.priority === 'Medium'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                          <button
                            onClick={() => deleteTask(task.id)}
                            className="text-slate-400 hover:text-rose-600 transition"
                            title="Delete Milestone"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span>Due: {task.dueDate}</span>
                          {isOverdue && (
                            <span className="text-rose-600 font-bold flex items-center gap-1">
                              <AlertCircle className="h-3.5 w-3.5" /> Overdue by {Math.abs(daysUntilDue)} days
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {task.category}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Event-Day Itinerary */}
      {activeTab === 'daySchedule' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 text-xs text-indigo-900 dark:text-indigo-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              <span>Event Date: <span className="font-bold">{activeEvent.date}</span> • Total Duration: <span className="font-bold">{activeEvent.durationHours || 8} Hours</span></span>
            </div>
            <button
              onClick={() => setIsScheduleModalOpen(true)}
              className="font-bold text-indigo-600 hover:underline"
            >
              + Add Activity
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-soft-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {(activeEvent.daySchedule || []).map((item, idx) => (
                <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="flex h-10 w-24 shrink-0 items-center justify-center rounded-xl bg-slate-100 font-bold text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                      {item.time}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.activity}</h4>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                        {item.location && <span>📍 {item.location}</span>}
                        {item.responsiblePerson && <span>👤 Lead: {item.responsiblePerson}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteScheduleItem(item.id)}
                    className="self-end sm:self-center text-slate-400 hover:text-rose-600 transition"
                    title="Delete Itinerary Item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Preparation Milestone"
        description="Set a due date and priority for this task."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Milestone Title</label>
            <input
              type="text"
              required
              value={taskForm.title}
              onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
              placeholder="e.g. Confirm Caterer Plate Count"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
              <select
                value={taskForm.priority}
                onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <input
                type="text"
                value={taskForm.category}
                onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                placeholder="e.g. Venue, Catering, Music"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date</label>
            <input
              type="date"
              value={taskForm.dueDate}
              onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
            <input
              type="text"
              value={taskForm.notes}
              onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
              placeholder="Additional context or requirements"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Schedule Modal */}
      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Add Day-Of Activity"
        description="Add a time-slotted segment to your itinerary."
        maxWidthClass="max-w-md"
      >
        <form onSubmit={handleCreateSchedule} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Time</label>
            <input
              type="text"
              required
              value={scheduleForm.time}
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })}
              placeholder="e.g. 06:30 PM"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Activity Name</label>
            <input
              type="text"
              required
              value={scheduleForm.activity}
              onChange={(e) => setScheduleForm({ ...scheduleForm, activity: e.target.value })}
              placeholder="e.g. Guest Arrival & Welcome Mocktails"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location / Area</label>
              <input
                type="text"
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                placeholder="e.g. Banquet Foyer"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Responsible Lead</label>
              <input
                type="text"
                value={scheduleForm.responsiblePerson}
                onChange={(e) => setScheduleForm({ ...scheduleForm, responsiblePerson: e.target.value })}
                placeholder="e.g. Event Coordinator"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-brand-600"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={() => setIsScheduleModalOpen(false)}
              className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-600 px-5 py-2 text-xs font-bold text-white hover:bg-brand-700 transition"
            >
              Save Activity
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
