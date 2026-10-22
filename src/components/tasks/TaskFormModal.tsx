import React, { useState, useEffect } from 'react';
import { Task, Priority, TaskCategory, MatrixQuadrant } from '../../types';
import { PixelModal, PixelButton, PixelInput, PixelCheckbox } from '../ui/PixelUI';
import { calculateQuadrant } from '../../db/storage';
import { notificationService } from '../../utils/notifications';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  initialTask?: Task | null;
}

const CATEGORIES: TaskCategory[] = [
  'Main Quest',
  'Work',
  'Study',
  'Health',
  'Personal',
  'Side Quest',
];

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [category, setCategory] = useState<string>('Main Quest');
  const [isImportant, setIsImportant] = useState<boolean>(true);
  const [isUrgent, setIsUrgent] = useState<boolean>(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(25);
  const [reminderSet, setReminderSet] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setDueDate(initialTask.dueDate || '');
      setDueTime(initialTask.dueTime || '');
      setPriority(initialTask.priority);
      setCategory(initialTask.category);
      setIsImportant(initialTask.isImportant);
      setIsUrgent(initialTask.isUrgent);
      setEstimatedMinutes(initialTask.estimatedMinutes || 25);
      setReminderSet(initialTask.reminderSet);
    } else {
      // Defaults for new task
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDescription('');
      setDueDate(today);
      setDueTime('18:00');
      setPriority('medium');
      setCategory('Main Quest');
      setIsImportant(true);
      setIsUrgent(false);
      setEstimatedMinutes(25);
      setReminderSet(true);
    }
    setError('');
  }, [initialTask, isOpen]);

  const liveQuadrant = calculateQuadrant(isUrgent, isImportant);

  const quadrantLabels: Record<MatrixQuadrant, { name: string; desc: string; badge: string }> = {
    q1_do_first: { name: 'Quadrant 1: Do First', desc: 'Urgent & Important (Boss battle / Immediate priority)', badge: 'bg-[#ef4444] text-white' },
    q2_schedule: { name: 'Quadrant 2: Schedule', desc: 'Not Urgent & Important (Strategic growth / Deep work)', badge: 'bg-[#38bdf8] text-[#0b0e14]' },
    q3_delegate: { name: 'Quadrant 3: Delegate', desc: 'Urgent & Not Important (Interruptions / Quick handoffs)', badge: 'bg-[#f59e0b] text-[#0b0e14]' },
    q4_eliminate: { name: 'Quadrant 4: Don\'t Do', desc: 'Not Urgent & Not Important (Time sinks / Low value)', badge: 'bg-[#64748b] text-white' },
  };

  const handleReminderToggle = async (checked: boolean) => {
    setReminderSet(checked);
    if (checked) {
      const perm = notificationService.getPermission();
      if (perm === 'default') {
        await notificationService.requestPermission();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quest title cannot be empty!');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      dueTime,
      priority,
      category,
      isImportant,
      isUrgent,
      matrixQuadrant: liveQuadrant,
      estimatedMinutes: Number(estimatedMinutes) || 25,
      reminderSet,
    });
    onClose();
  };

  return (
    <PixelModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? 'EDIT QUEST ORDER' : 'FORGE NEW QUEST'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <PixelInput
          label="Quest Title *"
          placeholder="e.g. Slay Weekly Report Dragon"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError('');
          }}
          error={error}
          autoFocus
        />

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="font-pixel text-[10px] text-[#94a3b8] tracking-wider uppercase">
            Description & Notes
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add scroll details, coordinates, or loot objectives..."
            className="bg-[#0b0e14] border-2 border-[#2c384e] text-[#ede4ce] px-3 py-2 font-mono text-sm focus:border-[#38bdf8] focus:bg-[#101726] focus:outline-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.6)] placeholder:text-[#475569] resize-none"
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PixelInput
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <PixelInput
            label="Due Time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
          />
        </div>

        {/* Priority & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] text-[#94a3b8] tracking-wider uppercase">
              Priority Rank
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="bg-[#0b0e14] border-2 border-[#2c384e] text-[#ede4ce] px-3 py-2 font-mono text-sm focus:border-[#38bdf8] focus:outline-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.6)] cursor-pointer"
            >
              <option value="critical">Rank S - Critical Boss (+50 XP)</option>
              <option value="high">Rank A - High Priority (+35 XP)</option>
              <option value="medium">Rank B - Standard Quest (+25 XP)</option>
              <option value="low">Rank C - Minor Side Task (+15 XP)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] text-[#94a3b8] tracking-wider uppercase">
              Category Tag
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#0b0e14] border-2 border-[#2c384e] text-[#ede4ce] px-3 py-2 font-mono text-sm focus:border-[#38bdf8] focus:outline-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.6)] cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Eisenhower Matrix Coordinates */}
        <div className="bg-[#090d14] border-2 border-[#222d3f] p-3 space-y-2.5">
          <span className="font-pixel text-[10px] text-[#38bdf8] block tracking-wide">
            EISENHOWER MATRIX COORDINATES
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PixelCheckbox
              checked={isImportant}
              onChange={(checked) => setIsImportant(checked)}
              label={
                <span className="font-mono text-xs">
                  <strong className="text-white">Important?</strong> (High impact / values)
                </span>
              }
            />

            <PixelCheckbox
              checked={isUrgent}
              onChange={(checked) => setIsUrgent(checked)}
              label={
                <span className="font-mono text-xs">
                  <strong className="text-white">Urgent?</strong> (Immediate deadline)
                </span>
              }
            />
          </div>

          {/* Resulting Quadrant Indicator */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#1a2333] text-xs">
            <span className={`px-2 py-0.5 font-pixel text-[10px] font-bold ${quadrantLabels[liveQuadrant].badge}`}>
              {quadrantLabels[liveQuadrant].name}
            </span>
            <span className="font-mono text-xs text-[#94a3b8]">
              {quadrantLabels[liveQuadrant].desc}
            </span>
          </div>
        </div>

        {/* Duration & Reminder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          <div className="flex flex-col gap-1">
            <label className="font-pixel text-[10px] text-[#94a3b8] tracking-wider uppercase">
              Est. Focus Duration (Min)
            </label>
            <input
              type="number"
              min={5}
              max={240}
              step={5}
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="bg-[#0b0e14] border-2 border-[#2c384e] text-[#ede4ce] px-3 py-2 font-mono text-sm focus:border-[#38bdf8] focus:outline-none shadow-[inset_2px_2px_0_0_rgba(0,0,0,0.6)]"
            />
          </div>

          <div className="pt-4">
            <PixelCheckbox
              checked={reminderSet}
              onChange={handleReminderToggle}
              label={
                <span className="font-mono text-xs">
                  ⏰ 15m advance alarm
                </span>
              }
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#222d3f]">
          <PixelButton type="button" variant="ghost" onClick={onClose}>
            CANCEL
          </PixelButton>
          <PixelButton type="submit" variant="primary">
            {initialTask ? 'SAVE CHANGES' : 'FORGE QUEST'}
          </PixelButton>
        </div>
      </form>
    </PixelModal>
  );
};
