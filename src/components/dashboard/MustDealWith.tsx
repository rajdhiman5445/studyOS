import React, { useState } from 'react';
import { Clock, Calendar, Check, CalendarDays } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { formatMinutes, formatDateLabel, isDateOverdue, getSubjectById, priorityConfig } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import type { Task } from '../../types';

export const MustDealWith: React.FC = () => {
  const { data, activeSemester, toggleTaskCompleted, rescheduleTask } = useStudyOS();
  const [reschedulingTaskId, setReschedulingTaskId] = useState<string | null>(null);
  const [newDateInput, setNewDateInput] = useState('');

  // Critical tasks: Important, High Priority, or Overdue, and UNFINISHED.
  const criticalTasks = data.tasks.filter((task) => {
    if (task.status === 'completed') return false;
    const isOverdue = isDateOverdue(task.dueDate);
    const isCritical = task.isImportant || task.priority === 'high' || isOverdue;
    return isCritical && (task.semesterId === activeSemester?.id || !activeSemester);
  });

  const handleStartReschedule = (task: Task) => {
    setReschedulingTaskId(task.id);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    setNewDateInput(`${y}-${m}-${d}`);
  };

  const handleConfirmReschedule = (taskId: string) => {
    if (newDateInput) {
      rescheduleTask(taskId, newDateInput);
      setReschedulingTaskId(null);
    }
  };

  return (
    <section className="bg-[#181818] rounded-xl border border-[#262626] overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#262626] bg-[#1A1A1A]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#F5F5F5]">
              Must Deal With
            </h2>
            {criticalTasks.length > 0 && (
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-medium bg-[#241719] text-[#E06C75] border border-[#3B1C1F]">
                {criticalTasks.length} requiring attention
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#8C8C8C] font-normal">
            Important unfinished assignments, derivation deadlines, and blockers
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="p-4 sm:p-6 space-y-3.5">
        {criticalTasks.length === 0 ? (
          <div className="py-10 text-center text-[#707070]">
            <p className="text-sm">No urgent deadlines or overdue bottlenecks.</p>
            <p className="text-xs text-[#525252] mt-1">
              Unfinished high-priority tasks remain visible here until completed or explicitly rescheduled.
            </p>
          </div>
        ) : (
          criticalTasks.map((task) => {
            const subject = getSubjectById(data.subjects, task.subjectId);
            const isOverdue = isDateOverdue(task.dueDate);
            const priorityBadge = priorityConfig[task.priority];

            return (
              <div
                key={task.id}
                className={`p-4 sm:p-5 rounded-lg border transition-all ${
                  isOverdue
                    ? 'border-l-4 border-l-[#E06C75] bg-[#1A1415] border-y border-r border-[#2C1A1C] hover:border-[#3D2225]'
                    : 'bg-[#1E1E1E] border border-[#282828] hover:border-[#383838]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3.5">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Completion Action */}
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className="mt-0.5 w-5 h-5 rounded border border-[#484848] hover:border-[#7EBA8C] hover:bg-[#17221A] flex items-center justify-center text-transparent hover:text-[#7EBA8C] transition-colors shrink-0"
                      title="Mark as completed"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-2 flex-1 min-w-0">
                      {/* Selective Monospace Metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        {subject && <SubjectBadge subject={subject} />}

                        <span className={`text-xs font-mono px-2 py-0.5 rounded border ${priorityBadge.badgeClass}`}>
                          {priorityBadge.label}
                        </span>

                        <span
                          className={`text-xs font-mono flex items-center gap-1.5 ${
                            isOverdue ? 'text-[#E06C75] font-medium' : 'text-[#8C8C8C]'
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          {isOverdue ? `Overdue (${formatDateLabel(task.dueDate)})` : `Due ${formatDateLabel(task.dueDate)}`}
                        </span>

                        <span className="text-xs font-mono text-[#8C8C8C] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          {formatMinutes(task.estimatedMinutes)}
                        </span>
                      </div>

                      {/* Task Title (16-17px, bold/medium, natural typography) */}
                      <h3 className="text-base sm:text-[17px] font-medium text-[#F5F5F5] leading-snug break-words">
                        {task.title}
                      </h3>

                      {/* Task Description (14-15px, comfortable leading) */}
                      {task.description && (
                        <p className="text-sm sm:text-[14.5px] text-[#A3A3A3] leading-relaxed break-words">
                          {task.description}
                        </p>
                      )}

                      {task.subtasks.length > 0 && (
                        <div className="text-xs text-[#707070] font-mono pt-1">
                          {task.subtasks.filter((s) => s.completed).length} of {task.subtasks.length} milestones complete
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reschedule Button */}
                  <div className="shrink-0 flex items-center gap-2 sm:self-start sm:mt-0.5 pl-8 sm:pl-0">
                    {reschedulingTaskId === task.id ? (
                      <div className="flex flex-wrap items-center gap-1.5 bg-[#141414] p-1.5 rounded border border-[#383838]">
                        <input
                          type="date"
                          value={newDateInput}
                          onChange={(e) => setNewDateInput(e.target.value)}
                          className="bg-[#222222] text-xs px-2.5 py-1 rounded border border-[#383838] text-[#F0F0F0] focus:outline-none"
                        />
                        <button
                          onClick={() => handleConfirmReschedule(task.id)}
                          className="px-2.5 py-1 rounded bg-[#EAEAEA] hover:bg-white text-[#121212] text-xs font-medium transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReschedulingTaskId(null)}
                          className="px-1.5 text-[#707070] hover:text-[#E0E0E0] text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartReschedule(task)}
                        className="px-3 py-1.5 rounded text-xs font-medium text-[#A3A3A3] hover:text-white bg-[#222222] hover:bg-[#2A2A2A] border border-[#2E2E2E] flex items-center gap-1.5 transition-colors"
                        title="Explicitly reschedule this task to a new date"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-[#707070]" />
                        <span>Reschedule</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
