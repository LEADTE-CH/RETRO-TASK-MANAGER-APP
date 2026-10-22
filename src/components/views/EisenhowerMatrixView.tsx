import React, { useState } from 'react';
import { Task, MatrixQuadrant } from '../../types';
import { PixelButton, PixelCard, PixelBadge } from '../ui/PixelUI';
import { TaskCard } from '../tasks/TaskCard';
import { retroAudio } from '../../utils/audio';

interface EisenhowerMatrixViewProps {
  tasks: Task[];
  onToggleComplete: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onUpdateQuadrant: (task: Task, newQuadrant: MatrixQuadrant) => void;
  onOpenCreateTask: (defaultQuadrant?: MatrixQuadrant) => void;
}

export const EisenhowerMatrixView: React.FC<EisenhowerMatrixViewProps> = ({
  tasks,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onStartFocus,
  onUpdateQuadrant,
  onOpenCreateTask,
}) => {
  const [mobileQuadrantTab, setMobileQuadrantTab] = useState<MatrixQuadrant>('q1_do_first');

  const activeTasks = tasks.filter((t) => !t.isCompleted);

  const quadrantsConfig: {
    id: MatrixQuadrant;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    badgeVariant: 'red' | 'cyan' | 'amber' | 'slate';
    bgAccent: string;
    headerBorder: string;
  }[] = [
    {
      id: 'q1_do_first',
      title: 'Q1: DO FIRST',
      subtitle: 'URGENT & IMPORTANT',
      description: 'Critical deadlines & crises. Tackle these boss encounters right now.',
      color: '#ef4444',
      badgeVariant: 'red',
      bgAccent: 'bg-[#1f0e13]',
      headerBorder: 'border-[#ef4444]',
    },
    {
      id: 'q2_schedule',
      title: 'Q2: SCHEDULE',
      subtitle: 'NOT URGENT & IMPORTANT',
      description: 'Long-term planning & skill leveling. Block dedicated focus sessions.',
      color: '#38bdf8',
      badgeVariant: 'cyan',
      bgAccent: 'bg-[#0d1d2b]',
      headerBorder: 'border-[#38bdf8]',
    },
    {
      id: 'q3_delegate',
      title: 'Q3: DELEGATE',
      subtitle: 'URGENT & NOT IMPORTANT',
      description: 'Interruptions & minor chores. Delegate to teammates or automate.',
      color: '#f59e0b',
      badgeVariant: 'amber',
      bgAccent: 'bg-[#21170a]',
      headerBorder: 'border-[#f59e0b]',
    },
    {
      id: 'q4_eliminate',
      title: 'Q4: DON\'T DO',
      subtitle: 'NOT URGENT & NOT IMPORTANT',
      description: 'Distractions & trivial requests. Postpone, cancel, or eliminate.',
      color: '#94a3b8',
      badgeVariant: 'slate',
      bgAccent: 'bg-[#121824]',
      headerBorder: 'border-[#475569]',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[10px] text-[#38bdf8] bg-[#0c202d] px-2 py-0.5 border border-[#38bdf8]">
              STRATEGY CONSOLE
            </span>
            <span className="font-mono text-xs text-[#94a3b8]">
              Prioritize by urgency & importance
            </span>
          </div>
          <h2 className="font-pixel text-base sm:text-lg text-[#ede4ce] tracking-tight">
            EISENHOWER DECISION MATRIX
          </h2>
        </div>

        <PixelButton variant="primary" onClick={() => onOpenCreateTask('q1_do_first')}>
          + ADD TO MATRIX
        </PixelButton>
      </div>

      {/* Mobile Tabbed Switcher (visible on screens < 1024px) */}
      <div className="block lg:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-[#090d14] border-2 border-[#1c2436]">
          {quadrantsConfig.map((q) => {
            const count = activeTasks.filter((t) => t.matrixQuadrant === q.id).length;
            const isSelected = mobileQuadrantTab === q.id;
            return (
              <button
                key={q.id}
                onClick={() => {
                  retroAudio.playBlip();
                  setMobileQuadrantTab(q.id);
                }}
                className={`p-2 text-left border cursor-pointer transition ${
                  isSelected
                    ? `${q.bgAccent} border-current text-white font-bold`
                    : 'bg-[#121824] border-[#2d3748] text-[#94a3b8]'
                }`}
                style={{ borderColor: isSelected ? q.color : undefined }}
              >
                <span className="font-pixel text-[9px] block truncate" style={{ color: q.color }}>
                  {q.title.split(':')[0]}
                </span>
                <span className="font-pixel text-base block mt-0.5">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Matrix Grid: 2x2 desktop or active mobile quadrant */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {quadrantsConfig.map((quad) => {
          const quadTasks = activeTasks.filter((t) => t.matrixQuadrant === quad.id);
          const isMobileVisible = mobileQuadrantTab === quad.id;

          return (
            <div
              key={quad.id}
              className={`flex flex-col bg-[#121824] pixel-border border-2 ${quad.headerBorder} ${
                !isMobileVisible ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Quadrant Header */}
              <div className={`p-4 border-b-2 border-[#1c2436] ${quad.bgAccent}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: quad.color }}
                    />
                    <h3 className="font-pixel text-xs text-[#ede4ce]">{quad.title}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <PixelBadge variant={quad.badgeVariant} size="sm">
                      {quadTasks.length} QUESTS
                    </PixelBadge>
                    <button
                      onClick={() => onOpenCreateTask(quad.id)}
                      className="w-6 h-6 flex items-center justify-center bg-[#0b0e14] border border-[#2d3748] text-white hover:border-[#38bdf8] text-xs font-pixel cursor-pointer"
                      title={`Add quest directly to ${quad.title}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-[#cbd5e1]">{quad.subtitle}</span>
                </div>
                <p className="font-mono text-[11px] text-[#94a3b8] mt-1">
                  {quad.description}
                </p>
              </div>

              {/* Tasks List inside Quadrant */}
              <div className="p-3.5 space-y-3 flex-1 min-h-[220px]">
                {quadTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-6 text-center border border-dashed border-[#2d3748]">
                    <span className="text-xl opacity-60">✨</span>
                    <span className="font-pixel text-[10px] text-[#64748b] mt-1">
                      QUADRANT EMPTY
                    </span>
                    <p className="font-mono text-xs text-[#475569] mt-1">
                      No active quests assigned here.
                    </p>
                    <button
                      onClick={() => onOpenCreateTask(quad.id)}
                      className="mt-3 text-[10px] font-pixel text-[#38bdf8] hover:underline cursor-pointer"
                    >
                      + Add Quest
                    </button>
                  </div>
                ) : (
                  quadTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onToggleComplete={onToggleComplete}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStartFocus={onStartFocus}
                      onQuadrantChange={onUpdateQuadrant}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
