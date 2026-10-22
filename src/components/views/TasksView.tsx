import React, { useState, useMemo } from 'react';
import { Task, Priority } from '../../types';
import { PixelButton, PixelInput, PixelCard } from '../ui/PixelUI';
import { TaskCard } from '../tasks/TaskCard';
import { retroAudio } from '../../utils/audio';

interface TasksViewProps {
  tasks: Task[];
  onOpenCreateTask: () => void;
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onClearCompleted?: () => void;
}

type FilterScope = 'all' | 'active' | 'today' | 'upcoming' | 'overdue' | 'completed';
type SortField = 'dueDate' | 'priority' | 'title' | 'duration';

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  onOpenCreateTask,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onClearCompleted,
}) => {
  const [search, setSearch] = useState('');
  const [scope, setScope] = useState<FilterScope>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const todayStr = new Date().toISOString().split('T')[0];

  // Distinct categories from existing tasks
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    tasks.forEach((t) => {
      if (t.category) cats.add(t.category);
    });
    return Array.from(cats);
  }, [tasks]);

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search filter
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchesTitle = task.title.toLowerCase().includes(q);
          const matchesDesc = (task.description || '').toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc) return false;
        }

        // Scope filter
        if (scope === 'active' && task.isCompleted) return false;
        if (scope === 'completed' && !task.isCompleted) return false;
        if (scope === 'today') {
          if (task.isCompleted || task.dueDate !== todayStr) return false;
        }
        if (scope === 'upcoming') {
          if (task.isCompleted || !task.dueDate || task.dueDate <= todayStr) return false;
        }
        if (scope === 'overdue') {
          if (task.isCompleted || !task.dueDate || task.dueDate >= todayStr) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        // Category filter
        if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortBy === 'dueDate') {
          const dateA = a.dueDate ? `${a.dueDate} ${a.dueTime || '00:00'}` : '9999-99-99';
          const dateB = b.dueDate ? `${b.dueDate} ${b.dueTime || '00:00'}` : '9999-99-99';
          comp = dateA.localeCompare(dateB);
        } else if (sortBy === 'priority') {
          const weight: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
          comp = weight[b.priority] - weight[a.priority];
        } else if (sortBy === 'title') {
          comp = a.title.localeCompare(b.title);
        } else if (sortBy === 'duration') {
          comp = (a.estimatedMinutes || 25) - (b.estimatedMinutes || 25);
        }
        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [tasks, search, scope, priorityFilter, categoryFilter, sortBy, sortOrder, todayStr]);

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-pixel text-sm sm:text-base text-[#ede4ce] tracking-tight">
            QUEST JOURNAL ({tasks.length})
          </h2>
          <span className="font-mono text-xs text-[#94a3b8]">
            Filter, organize, and dispatch your active missions
          </span>
        </div>

        <div className="flex items-center gap-2">
          {completedCount > 0 && onClearCompleted && (
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={() => {
                retroAudio.playAlert();
                onClearCompleted();
              }}
            >
              PURGE CLEARED ({completedCount})
            </PixelButton>
          )}
          <PixelButton variant="primary" onClick={onOpenCreateTask}>
            + FORGE QUEST
          </PixelButton>
        </div>
      </div>

      {/* Control Panel: Search & Filters */}
      <PixelCard className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <PixelInput
            placeholder="Search quest log by title, monster name, keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Scope Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
          {(
            [
              { id: 'all', label: 'ALL QUESTS' },
              { id: 'active', label: 'ACTIVE' },
              { id: 'today', label: 'TODAY' },
              { id: 'upcoming', label: 'UPCOMING' },
              { id: 'overdue', label: 'OVERDUE' },
              { id: 'completed', label: 'CLEARED' },
            ] as { id: FilterScope; label: string }[]
          ).map((tab) => {
            const isActive = scope === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  retroAudio.playBlip();
                  setScope(tab.id);
                }}
                className={`px-3 py-1.5 text-[10px] font-pixel whitespace-nowrap border cursor-pointer ${
                  isActive
                    ? 'border-[#39ff14] bg-[#0c2412] text-[#39ff14]'
                    : 'border-[#2d3748] bg-[#0b0e14] text-[#94a3b8] hover:text-white hover:border-[#4a5568]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Dropdowns & Sorting */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-[#1e293b] text-xs font-mono">
          {/* Priority */}
          <div>
            <label className="text-[10px] font-pixel text-[#64748b] block mb-1">
              PRIORITY
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#2d3748] px-2 py-1.5 text-xs text-[#ede4ce] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="all">All Ranks</option>
              <option value="critical">Rank S (Critical)</option>
              <option value="high">Rank A (High)</option>
              <option value="medium">Rank B (Medium)</option>
              <option value="low">Rank C (Low)</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="text-[10px] font-pixel text-[#64748b] block mb-1">
              CATEGORY
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#0b0e14] border border-[#2d3748] px-2 py-1.5 text-xs text-[#ede4ce] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="all">All Categories</option>
              {availableCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-pixel text-[#64748b] block mb-1">
              SORT BY
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="w-full bg-[#0b0e14] border border-[#2d3748] px-2 py-1.5 text-xs text-[#ede4ce] focus:outline-none focus:border-[#38bdf8]"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority Rank</option>
              <option value="title">Alphabetical (Title)</option>
              <option value="duration">Estimated Duration</option>
            </select>
          </div>

          {/* Order */}
          <div>
            <label className="text-[10px] font-pixel text-[#64748b] block mb-1">
              ORDER
            </label>
            <button
              type="button"
              onClick={() => {
                retroAudio.playBlip();
                setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
              }}
              className="w-full bg-[#0b0e14] border border-[#2d3748] hover:border-[#38bdf8] px-2 py-1.5 text-xs text-[#ede4ce] font-pixel flex items-center justify-between cursor-pointer"
            >
              <span>{sortOrder === 'asc' ? 'ASCENDING' : 'DESCENDING'}</span>
              <span>{sortOrder === 'asc' ? '▲' : '▼'}</span>
            </button>
          </div>
        </div>
      </PixelCard>

      {/* Results List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-[#121824] pixel-border p-8 text-center space-y-3">
            <span className="text-3xl block">🔍</span>
            <h4 className="font-pixel text-xs text-[#94a3b8]">NO MATCHING QUESTS FOUND</h4>
            <p className="font-mono text-xs text-[#64748b]">
              Try adjusting your search criteria or create a new quest.
            </p>
            <PixelButton variant="primary" size="sm" onClick={onOpenCreateTask}>
              + CREATE QUEST
            </PixelButton>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleComplete={onToggleComplete}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onStartFocus={onStartFocus}
            />
          ))
        )}
      </div>
    </div>
  );
};
