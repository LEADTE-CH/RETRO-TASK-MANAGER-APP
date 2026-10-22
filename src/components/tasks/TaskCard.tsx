import React from 'react';
import { Task, MatrixQuadrant } from '../../types';
import { PixelCheckbox, PixelBadge } from '../ui/PixelUI';
import { retroAudio } from '../../utils/audio';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onQuadrantChange?: (task: Task, quadrant: MatrixQuadrant) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onStartFocus,
  onQuadrantChange,
}) => {
  const isOverdue =
    !task.isCompleted &&
    task.dueDate &&
    task.dueDate < new Date().toISOString().split('T')[0];

  const isDueToday =
    !task.isCompleted &&
    task.dueDate === new Date().toISOString().split('T')[0];

  // Priority color & Rank Label
  const priorityInfo = {
    critical: { label: 'RANK-S', variant: 'red' as const, xp: 50 },
    high: { label: 'RANK-A', variant: 'amber' as const, xp: 35 },
    medium: { label: 'RANK-B', variant: 'cyan' as const, xp: 25 },
    low: { label: 'RANK-C', variant: 'slate' as const, xp: 15 },
  }[task.priority];

  // Quadrant readable label
  const quadrantInfo = {
    q1_do_first: { label: 'Q1: DO FIRST', color: 'text-[#ef4444] border-[#ef4444]' },
    q2_schedule: { label: 'Q2: SCHEDULE', color: 'text-[#38bdf8] border-[#38bdf8]' },
    q3_delegate: { label: 'Q3: DELEGATE', color: 'text-[#f59e0b] border-[#f59e0b]' },
    q4_eliminate: { label: 'Q4: DON\'T DO', color: 'text-[#94a3b8] border-[#475569]' },
  }[task.matrixQuadrant];

  return (
    <div
      className={`group relative bg-[#121824] pixel-border transition-all ${
        task.isCompleted
          ? 'opacity-65 border-[#1e293b] bg-[#0c1017]'
          : isOverdue
          ? 'border-[#ef4444] shadow-[0_0_10px_rgba(239,68,68,0.2)]'
          : 'hover:border-[#38bdf8]'
      } p-3.5 sm:p-4`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <div className="pt-0.5">
          <PixelCheckbox
            checked={task.isCompleted}
            onChange={() => onToggleComplete(task)}
            aria-label={`Mark "${task.title}" as ${task.isCompleted ? 'incomplete' : 'complete'}`}
          />
        </div>

        {/* Task Details */}
        <div className="flex-1 min-w-0">
          {/* Header Row: Badges & Rank */}
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <PixelBadge variant={priorityInfo.variant} size="sm">
              {priorityInfo.label}
            </PixelBadge>

            <span className={`text-[9px] font-pixel px-1.5 py-0.5 border uppercase ${quadrantInfo.color}`}>
              {quadrantInfo.label}
            </span>

            {task.category && (
              <span className="text-xs font-mono text-[#a5b4fc]">
                #{task.category}
              </span>
            )}

            {isOverdue && (
              <span className="font-pixel text-[9px] text-[#ef4444] bg-[#290d11] px-1.5 py-0.5 border border-[#ef4444] flex items-center gap-1">
                <span>⚠</span> OVERDUE
              </span>
            )}

            {isDueToday && (
              <span className="font-pixel text-[9px] text-[#39ff14] bg-[#0c2412] px-1.5 py-0.5 border border-[#39ff14]">
                ★ DUE TODAY
              </span>
            )}

            {task.syncStatus === 'pending' && (
              <span className="font-mono text-[10px] text-[#f59e0b]" title="Pending offline sync">
                [queued]
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`font-mono text-sm sm:text-base font-bold text-[#ede4ce] break-words ${
              task.isCompleted ? 'line-through text-[#64748b]' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* Description */}
          {task.description && (
            <p className="font-mono text-xs text-[#94a3b8] mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata Footer: Clean typographic row without pills */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-mono text-[#64748b] mt-3 flex-wrap">
            {task.dueDate && (
              <span className="flex items-center gap-1 text-[#cbd5e1]">
                <span>📅</span> {task.dueDate} {task.dueTime ? `@ ${task.dueTime}` : ''}
              </span>
            )}

            <span>·</span>

            <span className="flex items-center gap-1 text-[#38bdf8]">
              <span>⌛</span> {task.estimatedMinutes}m Focus
            </span>

            <span>·</span>

            <span className="flex items-center gap-1 text-[#39ff14] font-bold">
              <span>✦</span> +{priorityInfo.xp} XP
            </span>

            {task.reminderSet && (
              <>
                <span>·</span>
                <span className="text-[#f59e0b]" title="15m advance reminder active">
                  🔔 15m alert
                </span>
              </>
            )}

            {task.completedAt && (
              <>
                <span>·</span>
                <span className="text-[#22c55e]">
                  Cleared {new Date(task.completedAt).toLocaleDateString()}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Actions Button Group */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5">
          {!task.isCompleted && (
            <button
              onClick={() => {
                retroAudio.playBlip();
                onStartFocus(task);
              }}
              className="px-2 py-1 text-[10px] font-pixel bg-[#0c202d] text-[#38bdf8] border border-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#0b0e14] transition cursor-pointer"
              title="Launch Pomodoro Focus Session for this task"
            >
              FOCUS
            </button>
          )}

          <button
            onClick={() => {
              retroAudio.playBlip();
              onEdit(task);
            }}
            className="p-1.5 text-[#94a3b8] hover:text-[#ede4ce] hover:bg-[#1e293b] border border-transparent hover:border-[#334155] cursor-pointer"
            title="Edit Task"
            aria-label="Edit Task"
          >
            ✏️
          </button>

          <button
            onClick={() => {
              retroAudio.playAlert();
              onDelete(task);
            }}
            className="p-1.5 text-[#ef4444] hover:bg-[#290d11] border border-transparent hover:border-[#ef4444] cursor-pointer"
            title="Delete Task"
            aria-label="Delete Task"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Quick Move Quadrant dropdown for Matrix mode */}
      {onQuadrantChange && !task.isCompleted && (
        <div className="mt-3 pt-2 border-t border-[#1e293b] flex items-center justify-between text-xs font-mono">
          <span className="text-[#64748b]">Quick Move Matrix:</span>
          <div className="flex items-center gap-1">
            {(['q1_do_first', 'q2_schedule', 'q3_delegate', 'q4_eliminate'] as MatrixQuadrant[]).map(
              (quad) => {
                const isCurrent = task.matrixQuadrant === quad;
                const shortNames = {
                  q1_do_first: 'Q1',
                  q2_schedule: 'Q2',
                  q3_delegate: 'Q3',
                  q4_eliminate: 'Q4',
                };
                return (
                  <button
                    key={quad}
                    onClick={() => onQuadrantChange(task, quad)}
                    className={`px-1.5 py-0.5 text-[9px] font-pixel border cursor-pointer ${
                      isCurrent
                        ? 'border-[#39ff14] text-[#39ff14] bg-[#0c2412]'
                        : 'border-[#2d3748] text-[#94a3b8] hover:border-[#38bdf8] hover:text-white'
                    }`}
                  >
                    {shortNames[quad]}
                  </button>
                );
              }
            )}
          </div>
        </div>
      )}
    </div>
  );
};
