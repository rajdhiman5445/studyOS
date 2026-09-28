import React, { useState } from 'react';
import { Check, Clock, CalendarDays, Plus } from 'lucide-react';
import { useStudyOS } from '../../lib/storage';
import { formatMinutes, getSubjectById, getTodayDateString, statusConfig } from '../../lib/utils';
import { SubjectBadge } from '../common/SubjectBadge';
import type { Task } from '../../types';

export const TodaysPlan: React.FC<{ onOpenQuickCapture?: () => void }> = ({ onOpenQuickCapture }) => {
  const { data, activeSemester, toggleTaskCompleted, rescheduleTask } = useStudyOS();
  const [reschedulingId, setReschedulingId] = useState<string | null>(null);
  const [targetDate, setTargetDate] = useState('');

  const today = getTodayDateString();

  const todaysTasks = data.tasks.filter((t) => {
    const isForActiveSemester = !activeSemester || t.semesterId === activeSemester.id;
    return isForActiveSemester && (t.scheduledDate === today || t.dueDate === today);
  });

  const completedCount = todaysTasks.filter((t) => t.status === 'completed').length;
  const totalPlannedMinutes = todaysTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);

  const handleStartReschedule = (task: Task) => {
    setReschedulingId(task.id);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const y = tomorrow.getFullYear();
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const d = String(tomorrow.getDate()).padStart(2, '0');
    setTargetDate(`${y}-${m}-${d}`);
  };

  const handleSaveReschedule = (taskId: string) => {
    if (targetDate) {
      rescheduleTask(taskId, targetDate);
      setReschedulingId(null);
    }
  };

  return (
    <section className="bg-[#181818] rounded-xl border border-[#262626] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#1A1A1A]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-[#F5F5F5]">
              Today's Plan
            </h2>
            <span className="text-xs font-mono text-[#8C8C8C]">
              {completedCount} of {todaysTasks.length} completed
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#8C8C8C] mt-1 font-normal">
            Estimated time planned: {formatMinutes(totalPlannedMinutes)}
          </p>
        </div>

        {onOpenQuickCapture && (
          <button
            onClick={onOpenQuickCapture}
            className="text-xs text-[#A3A3A3] hover:text-white flex items-center gap-1.5 font-medium transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="p-4 sm:p-6 space-y-3">
        {todaysTasks.length === 0 ? (
          <div className="py-10 text-center text-[#707070]">
            <p className="text-sm">No tasks scheduled for today yet.</p>
            {onOpenQuickCapture && (
              <button
                onClick={onOpenQuickCapture}
                className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-[#222222] text-[#F0F0F0] hover:bg-[#2A2A2A] border border-[#2E2E2E] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Schedule a Task
              </button>
            )}
          </div>
        ) : (
          todaysTasks.map((task) => {
            const subject = getSubjectById(data.subjects, task.subjectId);
            const isCompleted = task.status === 'completed';
            const statusBadge = statusConfig[task.status];

            return (
              <div
                key={task.id}
                className={`p-3.5 sm:p-4 rounded-lg border transition-all ${
                  isCompleted
                    ? 'bg-[#151C17] border-[#223326]'
                    : 'bg-[#1E1E1E] border-[#282828] hover:border-[#383838]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTaskCompleted(task.id)}
                      className={`mt-0.5 sm:mt-0 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isCompleted
                          ? 'bg-[#17221A] border-[#2E4A35] text-[#7EBA8C]'
                          : 'border-[#484848] hover:border-[#7EBA8C] text-transparent'
                      }`}
                      title={isCompleted ? 'Mark uncompleted' : 'Mark completed'}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>

                    <div className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-2.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        {subject && <SubjectBadge subject={subject} />}
                        {isCompleted && (
                          <span className="text-xs font-mono text-[#7EBA8C] bg-[#17221A] px-2 py-0.5 rounded border border-[#273d2e]">
                            Done
                          </span>
                        )}
                      </div>

                      <span
                        className={`text-[15px] sm:text-base font-medium leading-snug break-words ${
                          isCompleted ? 'text-[#8EA895] line-through' : 'text-[#F5F5F5]'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                  </div>

                  {/* Right Meta & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-8 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242424]">
                    <span className="text-xs font-mono text-[#8C8C8C] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatMinutes(task.estimatedMinutes)}
                    </span>

                    {!isCompleted && (
                      <span className={`text-xs font-mono px-2 py-0.5 rounded border ${statusBadge.badgeClass}`}>
                        {statusBadge.label}
                      </span>
                    )}

                    {/* Reschedule */}
                    {reschedulingId === task.id ? (
                      <div className="flex flex-wrap items-center gap-1.5 bg-[#141414] p-1 rounded border border-[#383838]">
                        <input
                          type="date"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="bg-[#222222] text-xs px-2 py-0.5 rounded text-[#F0F0F0] border border-[#383838]"
                        />
                        <button
                          onClick={() => handleSaveReschedule(task.id)}
                          className="px-2 py-0.5 bg-[#EAEAEA] text-[#121212] text-xs rounded font-medium"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="text-[#707070] text-xs px-1 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleStartReschedule(task)}
                        className="p-1.5 rounded text-[#707070] hover:text-white hover:bg-[#262626] transition-colors"
                        title="Reschedule to another day"
                      >
                        <CalendarDays className="w-4 h-4" />
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
